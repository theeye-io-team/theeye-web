
import App from 'ampersand-app'
import isMongoId from 'validator/lib/isMongoId'
import XHR from 'lib/xhr'
import bootbox from 'bootbox'
import { Factory as TaskFactory } from 'models/task'
import * as TaskConstants from 'constants/task'
import TaskRouter from 'router/task'
import after from 'lodash/after'
import FileSaver from 'file-saver'
import { ExecTask as ExecTaskView } from 'view/page/dashboard/task/task/exec-task.js'
import { Model as File } from 'models/file'
import loggerModule from 'lib/logger'

const emptyCallback = () => {}
const logger = loggerModule('actions:tasks')

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
      fail: () => {
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
      const taskData = Object.assign({}, data, { host_id: hosts[0] })
      return create(taskData)
        .then(task => {
          // handle to display a custome message
          App.state.alerts.success('Success', `Task ${task.name} created.`)
          successCreated([task])
        })
        .catch(err => {
          console.error(err)
          App.state.alerts.danger('Something goes wrong.')
        })
    } else {
      const promises = []
      for (let host_id of hosts) {
        const taskData = Object.assign({}, data, { host_id })
        promises.push( create(taskData) )
      }

      return Promise.all(promises).then(tasks => {
        App.state.alerts.success('Success', 'All Tasks created.')
        successCreated(tasks)
      }).catch(err => {
        console.error(err)
        App.state.alerts.danger('Something goes wrong.')
      })
    }
  },
  create (data) {
    if (data.hosts) {
      return this.createMany(data.hosts, data)
    } else {
      return create(data)
        .then(task => {
          successCreated([task])
          return (task)
        })
        .catch(err => {
          console.error(err)
          App.state.alerts.danger('Something goes wrong.')
        })
    }
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
    task.is_loading = true
    if (task.isNew()) { return }

    if (task.type === TaskConstants.TYPE_SCRIPT) {
      const script = task.script
      if (script !== undefined && !script.id) {
        script.id = task.script_id
        script.fetch()
      }
    }

    App.actions.scheduler.fetch(task)

    task.fetchJobs({}, (err) => {
      task.is_loading = false
    })
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
  exportArguments (id, options = {}) {
    const task = App.state.tasks.get(id).serialize()
    if (task) {
      let warn = false
      let content = task.task_arguments
      content.forEach(arg => {
        if (arg.type === 'fixed') {
          arg.value = undefined
          warn = true
        }
      })
      const callback = () => {
        const jsonContent = JSON.stringify(content)
        const blob = new Blob([jsonContent], { type: 'application/json' })
        const fileName = task.name.replace(/ /g,'_')
        FileSaver.saveAs(blob, `${fileName}_arguments.json`)
      }
      if (warn) {
        bootbox.alert('For security reasons, "Fixed value" arguments are exported with an undefined value', callback)
      } else callback()
    }
  },
  fetchRecipe (id, { mode }, next = emptyCallback) {
    const task = App.state.tasks.get(id)
    XHR.send({
      method: 'GET',
      url: `${task.url()}/serialize?mode=${mode||'shallow'}`,
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
  parseSerialization (recipe) {
    // backward compatible with old recipes
    let serial
    if (recipe.task) {
      serial = recipe.task
    } else {
      serial = recipe
    }

    if (recipe.file) {
      if (/data:.*;base64/.test(recipe.file.data) === false) {
        serial.script = recipe.file
        // transform to data url
        serial.script.data = `data:text/plain;base64,${recipe.file.data}`
      }
    }

    // properties that are not valid must be reseted
    switch (serial.type) {
      case TaskConstants.TYPE_SCRIPT:
        if (!App.state.hosts.get(serial.host_id)) {
          serial.host = null
          serial.host_id = null
        }

        if (!App.state.files.get(serial.script_id)) {
          serial.script_id = null
        }
        break;

      case TaskConstants.TYPE_SCRAPER:
        if (!App.state.hosts.get(serial.host_id)) {
          serial.host = null
          serial.host_id = null
        }
        break;
    }

    const task = new TaskFactory(serial, { store: false, parse: true })
    return task
  },
  recipeHasArguments (recipe) {
    if (Array.isArray(recipe)) {
      return (recipe.length > 0)
    }

    if (recipe && recipe.task) {
      switch (recipe.task.type) {
        case TaskConstants.TYPE_SCRAPER:
        case TaskConstants.TYPE_SCRIPT:
        case TaskConstants.TYPE_APPROVAL:
        case TaskConstants.TYPE_DUMMY:
        case TaskConstants.TYPE_NOTIFICATION:
        //case TaskConstants.TYPE_GROUP:
          return (
            Array.isArray(recipe.task.task_arguments) &&
            recipe.task.task_arguments.length > 0
          )
        default:
          return false
      }
    }

    return false
  },
  execute (task) {
    const execTask = new ExecTaskView({ model: task })
    execTask.execute()
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
    const task = new TaskFactory(data, { store: false })
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
      fail (response, xhr) {
        reject(response)
      }
    })
  })
}

const createUsingRecipe = (data) => {
  return new Promise((resolve, reject) => {
    const task = new TaskFactory(data, { store: false })

    const formData = new FormData()

    formData.append('task', new Blob([
      JSON.stringify(task.serialize())
    ], {
      type: 'application/json'
    }))

    if (data.file) {
      const file = data.file
      const script = {
        filename: file.filename,
        description: file.description,
        extension: file.filename.split('.').pop(),
        mimetype: file.mimetype
      }

      formData.append('script', new Blob([
        JSON.stringify(script)
      ], {
        type: "application/json"
      }))

      const fileBlob = new Blob([file.data], { type: file.mimetype })
      formData.append('scriptContent', fileBlob, file.filename)
    }

    XHR.send({
      url: task.url(),
      formData,
      method: 'POST',
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done (response, xhr) {
        task.set(response)
        App.state.tasks.add(task, { merge: true })
        resolve(task)
      },
      fail (response, xhr) {
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

const isObject = (value) => {
  return (
    typeof value === 'object' &&
    ! Array.isArray(value) &&
    value !== null
  )
}
