'use strict'

import App from 'ampersand-app'
import XHR from 'lib/xhr'
import bootbox from 'bootbox'
const logger = require('lib/logger')('actions:jobs')
const config = require('config')
import TaskConstants from 'constants/task'
import LifecycleConstants from 'constants/lifecycle'
import {ExecApprovalTask} from 'view/page/dashboard/task/task/exec-task.js'

const updateJob = (job, data) => {
  // reset
  job.clear()
  job.result.clear()
  job.user.clear()

  // and update
  job.set(data)
  job.result.set(data.result)
  job.user.set(data.user)
}

module.exports = {
  /**
   *
   * @summary this is being updated via socket event
   * @param {Object} data job model properties
   *
   */
  applyStateUpdate (data) {
    const task_id = data.task_id
    const task = App.state.tasks.get(task_id)

    if (!task) {
      logger.error('task not found')
      logger.error(task)
      return
    }


    updateJob(task.lastjob, data)
    this.handleApprovalTask(task)
  },
  createFromTask (task, args) {
    logger.log('creating new job with task %o', task)

    XHR.send({
      method: 'post',
      url: `${config.api_url}/job`,
      jsonData: { task: task.id, task_arguments: args },
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done (data,xhr) {
        logger.debug('job created. updating task')
        task.lastjob.set(data)
      },
      fail (err,xhr) {
        bootbox.alert('Job creation failed')
        console.log(arguments)
      }
    })
  },
  cancel (job) {
    XHR.send({
      method: 'put',
      url: `${config.api_url}/job/${job.id}/cancel`,
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done (data,xhr) {
        logger.debug('job canceled')
        job.clear()
        job.result.clear()
        job.set('lifecycle',LifecycleConstants.CANCELED)
      },
      fail (err,xhr) {
        bootbox.alert('something goes wrong')
        console.log(arguments)
      }
    })
  },
  approve (job, args) {
    XHR.send({
      method: 'put',
      url: `${config.api_v3_url}/job/${job.id}/approve`,
      jsonData: {
        result: {
          state: 'success',
          data: args || []
        }
      },
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done (data,xhr) {
        logger.debug('job approved')
        //job.clear()
        //job.result.clear()
        //job.set('lifecycle', LifecycleConstants.CANCELED)
      },
      fail (err,xhr) {
        bootbox.alert('something goes wrong')
        console.log(arguments)
      }
    })
  },
  reject (job, args) {
    XHR.send({
      method: 'put',
      url: `${config.api_v3_url}/job/${job.id}/reject`,
      jsonData: {
        result: {
          state: 'failure',
          data: args || []
        }
      },
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done (data,xhr) {
        logger.debug('job rejected')
        //job.clear()
        //job.result.clear()
        //job.set('lifecycle',LifecycleConstants.CANCELED)
      },
      fail (err,xhr) {
        bootbox.alert('something goes wrong')
        console.log(arguments)
      }
    })
  },
  /**
   *
   * @summary check if should show approval modal
   * @param {Object} data job model properties
   *
   */
  handleApprovalTask (task) {
    var requestApproval = (
      task.type === TaskConstants.TYPE_APPROVAL &&
      task.approver_id === App.state.session.user.id &&
      task.lastjob &&
      task.lastjob.lifecycle === LifecycleConstants.ONHOLD
    )

    if (requestApproval) {
      var execApprovalTask = new ExecApprovalTask({model: task})
      execApprovalTask.execute(true)
    }
  }
}
