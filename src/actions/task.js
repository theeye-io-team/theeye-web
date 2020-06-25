
import App from 'ampersand-app'
import XHR from 'lib/xhr'
import bootbox from 'bootbox'
import { Factory as TaskModelFactory } from 'models/task'
import * as TaskConstants from 'constants/task'
import TaskRouter from 'router/task'
import assign from 'lodash/assign'
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
  getCredentials (id, next) {
    next || (next=()=>{})
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
   * @param {Function} next
   */
  createMany (hosts,data) {
    const done = after(hosts.length,() => {
      App.state.alerts.success('Success', 'Tasks created.')
      App.state.events.fetch()
      App.state.tags.fetch()
      if (App.state.onboarding.onboardingActive) {
        bootbox.alert({
          message: 'Congratulations!, Your first task has been created Successfully!',
          callback: function () {
            bootbox.alert(`<p style='text-align: left;'>We're building our marketplace. Find further documentation at <a href='${App.config.docs}' target='_blank'>${App.config.docs}</a></p><p>If you need help please email us at <a href='mailto:support@theeye.io'>support@theeye.io.</a></p>`)
          }
        })
        App.actions.onboarding.onboardingCompleted(true)
      }
    })
    hosts.forEach(host => {
      let taskData = assign({},data,{ host_id: host })
      create(taskData,done)
    })
  },
  create (data) {
    create(data, function () {
      App.state.events.fetch()
    })
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
    if (task.type === TaskConstants.TYPE_SCRIPT) {
      const script = task.script
      if (script !== undefined && !script.id) {
        script.id = task.script_id
        script.fetch()
      }
    }

    task.fetchJobs(function () { return })
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
   *
   */
  exportRecipe (id) {
    let task = App.state.tasks.get(id)
    this.fetchRecipe(id, (err, recipe) => {
      if (!err) {
        var jsonContent = JSON.stringify(recipe)
        var blob = new Blob([jsonContent], { type: 'application/json' })
        let fname = task.name.replace(/ /g,'_')
        FileSaver.saveAs(blob, `${fname}.json`)
      }
    })
  },
  fetchRecipe (id, next) {
    next || (next = emptyCallback)
    const task = App.state.tasks.get(id)
    XHR.send({
      method: 'GET',
      url: `${task.url()}/recipe`,
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
    var execTask
    if (!App.state.session.licenseExpired) {
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
 * @param {Function} next
 */
const create = function (data, next) {
  next || (next = emptyCallback)
  const task = TaskModelFactory(data)
  XHR.send({
    url: task.url(),
    method: 'POST',
    jsonData: task.serialize(),
    headers: {
      Accept: 'application/json;charset=UTF-8'
    },
    done (response, xhr) {
      task.set(response)
      App.state.tasks.add(task, { merge: true })
      next(null, task)
    },
    error (response, xhr) {
      next(new Error())
    }
  })
}
