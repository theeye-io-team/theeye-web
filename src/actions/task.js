'use strict'

import App from 'ampersand-app'
import XHR from 'lib/xhr'
import bootbox from 'bootbox'
//import config from 'config'
import TaskModel from 'models/task'
import assign from 'lodash/assign'
import after from 'lodash/after'
import OnboardingActions from 'actions/onboarding'

const logger = require('lib/logger')('actions:tasks')

module.exports = {
  update (id, data) {
    let task = App.state.tasks.get(id)
    task.taskArguments.reset([])
    task.set(data)
    //task.taskArguments.reset(data.taskArguments)
    task.save({},{
      success: () => {
        bootbox.alert('Task Updated')
      },
      error: () => {
        bootbox.alert('Something goes wrong updating the Task')
      }
    })
  },
  /**
   * @param {MongoID[]} hosts
   * @param {Object} data
   * @param {Function} next
   */
  createMany (hosts,data) {
    const done = after(hosts.length,() => {
      App.state.alerts.success('Success', 'Tasks created.')
      if(App.state.onboarding.onboardingActive) {
        bootbox.alert('Congratulations!, Your first task has been created Successfully!')
        OnboardingActions.updateOnboarding(true)
      }
    })
    hosts.forEach(host => {
      let taskData = assign({},data,{ host_id: host })
      create(taskData,done)
    })
  },
  remove (id) {
    const task = App.state.tasks.get(id)
    task.destroy({
      success () {
        bootbox.alert('Task Deleted')
        App.state.tasks.remove( task )
      }
    })
  },
  populate (task) {
    const script = task.script
    if (script !== undefined && !script.id) {
      script.id = task.script_id
      script.fetch()
    }
  }
}

/**
 * @param {Object} data
 * @param {Function} next
 */
const create = (data,next) => {
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
}
