
import App from 'ampersand-app'
import XHR from 'lib/xhr'
import bootbox from 'bootbox'
import { Factory as TaskModelFactory } from 'models/task'
import * as TaskConstants from 'constants/task'
import TaskRouter from 'router/task'
import after from 'lodash/after'
import TaskFormActions from 'actions/taskform'
import FileSaver from 'file-saver'
const emptyCallback = () => {}
import { ExecTask, ExecTaskWithNoHost } from 'view/page/dashboard/task/task/exec-task.js'
import { Model as File } from 'models/file'

import loggerModule from 'lib/logger'; const logger = loggerModule('actions:tasks')

export default {
  nodeWorkflow (node) {
    App.navigate('/admin/workflow/' + node)
  },
  getCredentials (id, next = emptyCallback) {
    const task = App.state.tasks.get(id)

    XHR.send({
      method: 'GET',
      url: `${task.url()}/credentials`,
      done (credentials) {
        task.credentials = credentials
      },
      fail (err, xhr) {
        let msg = 'Error retrieving task integrations credentials.'
        bootbox.alert(msg)
        return next(new Error(msg))
      }
    })
  },
  update (id, data) {
    let task = App.state.tasks.get(id)
    if (task.type == 'script') {
      task.task_arguments.reset([])
    }
    task.set(data)
    task.save({},{
      success: () => {
        App.state.alerts.success('Success', 'Tasks Updated')
        App.state.events.fetch()
        App.state.tags.fetch()
      },
      error: () => {
        bootbox.alert('Something goes wrong updating the Task')
      }
    })
  },
  applyStateUpdate (model) {
    var id = model.id
    const task = App.state.tasks.get(id)
    if (!task) {
      App.state.tasks.add(model)
    } else {
      task.set(task.parse(model))
    }
  },
  /**
   * @param {MongoID[]} hosts
   * @param {Object} data
   */
  createMany (hosts, data) {
    if (hosts.length === 1) {
      let taskData = Object.assign({}, data, { host_id: hosts[0] })
      create(taskData)
        .then(task => {
          // handle to display a custome message
          App.state.alerts.success('Success', `Task ${task.name} created.`)
          successCreated([task])
        })
        .catch(errResponse => {})
    } else {
      let promises = []
      for (let host_id of hosts) {
        let taskData = Object.assign({}, data, { host_id })
        promises.push( create(taskData) )
      }

      Promise.all(promises).then(tasks => {
        App.state.alerts.success('Success', 'All Tasks created.')
        successCreated(tasks)
      }).catch(err => {})
    }
  },
  create (data) {
    create(data)
      .then(task => successCreated([ task ]))
      .catch(err => {})
  },
  remove (id) {
    const task = App.state.tasks.get(id)
    task.destroy({
      success () {
        App.state.alerts.success('Success', 'Tasks Removed.')
        App.state.tasks.remove( task )
        App.state.events.fetch()
      }
    })
  },
  populate (task) {
    if (task.isNew()) { return }

    if (task.type === TaskConstants.TYPE_SCRIPT) {
      const script = task.script
      if (script !== undefined && !script.id) {
        script.id = task.script_id
        script.fetch()
      }
    }

    task.fetchJobs(() => {})
    App.actions.scheduler.fetch(task)
  },
  massiveDelete (tasks) {
    App.state.loader.visible = true

    var errors = 0
    const done = after(tasks.length,()=>{
      if (errors > 0) {
        const count = (errors===tasks.length) ? 'all' : 'some of'
        bootbox.alert(
          `Well, ${count} the delete request came back with error. Reloding now...`,() => {
            //window.location.reload()
            App.Router.reload()
          }
        )
      } else {
        App.state.loader.visible = false
        bootbox.alert('That\'s it, they are gone. Congrats.',() => { })
      }
    })

    tasks.forEach(function(task){
      task.destroy({
        success () {
          App.state.tasks.remove(task)
          done()
        },
        error () {
          errors++
          done()
        }
      })
    })
  },
  /**
   *
   * @summary export task recipe
   * @param {String} id task id
   * @param {Object} options default {}
   *
   */
  exportRecipe (id, options = {}) {
    let task = App.state.tasks.get(id)
    this.fetchRecipe(id, options, (err, recipe) => {
      if (!err) {
        var jsonContent = JSON.stringify(recipe)
        var blob = new Blob([jsonContent], { type: 'application/json' })
        let fname = task.name.replace(/ /g,'_')
        FileSaver.saveAs(blob, `${fname}.json`)
      }
    })
  },
  fetchRecipe (id, { backup }, next = emptyCallback) {
    const task = App.state.tasks.get(id)
    XHR.send({
      method: 'GET',
      url: `${task.url()}/recipe?backup=${backup||false}`,
      done (recipe) {
        next(null, recipe)
      },
      fail (err, xhr) {
        let msg = 'Error retrieving task recipe.'
        bootbox.alert(msg)
        return next(new Error(msg))
      }
    })
  },
  parseRecipe (recipe) {
    if (recipe.task.type === TaskConstants.TYPE_SCRAPER) {
      recipe.task.remote_url = recipe.task.url
      delete recipe.task.url
    }

    let task = TaskModelFactory(recipe.task)

    if (recipe.file) {
      let file = new File(recipe.file, { parse: true })
      file.dataFromBase64(recipe.file.data)
      TaskFormActions.setFile(file._values)
    } else {
      TaskFormActions.clearFile()
    }

    return task
  },
  execute (task) {
    let execTask
    if (!App.state.session.licenseExpired) {
      if (!task.canExecute) {
        bootbox.alert('This task cannot be executed')
        return
      }

      if (task.hasHost()) {
        execTask = new ExecTask({ model: task })
      } else {
        execTask = new ExecTaskWithNoHost({ model: task })
      }
      execTask.execute()
    } else {
      bootbox.alert('Your license has expired! </br> Please contact your service provider to activate the product again.')
    }
  },
  edit (id) {
    // route edit file action
    let router = new TaskRouter()
    router.route('edit', { id })
  }
}

/**
 * @param {Object} data
 * @return {Promise}
 */
const create = (data) => {
  return new Promise((resolve, reject) => {
    const task = TaskModelFactory(data)
    XHR.send({
      url: task.url(),
      jsonData: task.serialize(),
      method: 'POST',
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done (response, xhr) {
        task.set(response)
        App.state.tasks.add(task, { merge: true })
        resolve(task)
      },
      error (response, xhr) {
        reject(response)
      }
    })
  })
}

const successCreated = () => {
  App.state.events.fetch()
  App.state.tags.fetch()

  if (App.state.onboarding.onboardingActive) {
    bootbox.alert({
      message: 'Congratulations! Your first task has been created Successfully!',
      callback: function () {
        let text = `<p style='text-align: left;'>We're building our marketplace. Find further documentation at <a href='${App.config.docs}' target='_blank'>${App.config.docs}</a></p><p>If you need help please email us at <a href='mailto:support@theeye.io'>support@theeye.io.</a></p>`
        bootbox.alert(text)
      }
    })

    App.actions.onboarding.onboardingCompleted(true)
  }
}
