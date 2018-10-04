
import App from 'ampersand-app'
import XHR from 'lib/xhr'
import bootbox from 'bootbox'
import TaskModel from 'models/task'
import TaskConstants from 'constants/task'
import TaskRouter from 'router/task'
import assign from 'lodash/assign'
import after from 'lodash/after'
import OnboardingActions from 'actions/onboarding'
import WorkflowActions from 'actions/workflow'
import TaskFormActions from 'actions/taskform'
import config from 'config'
import FileSaver from 'file-saver'
const emptyCallback = () => {}
import { ExecTask, ExecApprovalTask } from 'view/page/dashboard/task/task/exec-task.js'
import { Model as File } from 'models/file'

const logger = require('lib/logger')('actions:tasks')

module.exports = {
  nodeWorkflow (node) {
    App.navigate('/admin/workflow/' + node)
  },
  update (id, data) {
    let task = App.state.tasks.get(id)
    task.task_arguments.reset([])
    task.output_parameters.reset([])
    task.set(data)
    //task.task_arguments.reset(data.task_arguments)
    task.save({},{
      success: () => {
        if (task.workflow_id) {
          WorkflowActions.updateAcl(task.workflow_id)
        }
        App.state.alerts.success('Success', 'Tasks Updated')
        App.state.events.fetch()
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
      if(App.state.onboarding.onboardingActive) {
        bootbox.alert('Congratulations!, Your first task has been created Successfully!')
        OnboardingActions.updateOnboarding(true)
        OnboardingActions.hideOnboarding()
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
    XHR.send({
      method: 'GET',
      url: `${config.api_v3_url}/task/${id}/recipe`,
      done: recipe => next(null, recipe),
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

    let task = TaskModel.Factory(recipe.task)

    if (recipe.file) {
      let file = new File(recipe.file, {parse: true})
      TaskFormActions.setFile(file._values)
    } else {
      TaskFormActions.clearFile()
    }

    return task
  },
  execute (task) {
    var execTask
    if (!App.state.session.licenseExpired) {
      if (task.type === TaskConstants.TYPE_APPROVAL) {
        execTask = new ExecApprovalTask({ model: task })
      } else {
        execTask = new ExecTask({ model: task })
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
  const task = TaskModel.Factory(data)
  XHR.send({
    url: task.urlRoot,
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
