
import App from 'ampersand-app'
import XHR from 'lib/xhr'
import bootbox from 'bootbox'
import TaskModel from 'models/task'
import TaskConstants from 'constants/task'
import assign from 'lodash/assign'
import after from 'lodash/after'
import OnboardingActions from 'actions/onboarding'
const emptyCallback = () => {}

const logger = require('lib/logger')('actions:tasks')

module.exports = {
  nodeWorkflow (node) {
    App.navigate('/admin/workflow/' + node)
  },
  update (id, data) {
    let task = App.state.tasks.get(id)
    task.task_arguments.reset([])
    task.set(data)
    //task.task_arguments.reset(data.task_arguments)
    task.save({},{
      success: () => {
        bootbox.alert('Task Updated')
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
    task.set(task.parse(model))
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
      }
    })
    hosts.forEach(host => {
      let taskData = assign({},data,{ host_id: host })
      this.create(taskData,done)
    })
  },
  /**
   * @param {Object} data
   * @param {Function} next
   */
  create (data, next) {
    next || (next = emptyCallback)
    const task = TaskModel.Factory(data)
    XHR.send({
      url: task.urlRoot,
      method: 'POST',
      jsonData: task.serialize(),
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done (response,xhr) {
        task.set(response)
        App.state.tasks.add(task,{ merge: true })
        next(null,task)
      },
      error (response,xhr) {
        next(new Error())
      },
    })
  },
  remove (id) {
    const task = App.state.tasks.get(id)
    task.destroy({
      success () {
        bootbox.alert('Task Deleted')
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
  }
}

