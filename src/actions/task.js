'use strict'

import App from 'ampersand-app'
import XHR from 'lib/xhr'
import bootbox from 'bootbox'
//import config from 'config'
import TaskModel from 'models/task'
import assign from 'lodash/assign'
import after from 'lodash/after'

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
      bootbox.alert('All tasks created')
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
const create = function (data,next) {
  const task = TaskModel.Factory(data)
  XHR.send({
    url: task.urlRoot,
    method: 'POST',
    jsonData: task.serialize(),
    timeout: 5000,
    withCredentials: true,
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
