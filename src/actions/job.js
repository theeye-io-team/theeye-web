'use strict'

import App from 'ampersand-app'
import XHR from 'lib/xhr'
import bootbox from 'bootbox'
const logger = require('lib/logger')('actions:jobs')
const config = require('config')
import LIFECYCLE from 'constants/lifecycle'

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
  /** this is being updated via socket event */
  update (data) {
    logger.log('job updates received')

    const task_id = data.task_id
    const task = App.state.tasks.get(task_id)

    if (!task) {
      logger.error('task not found')
      logger.error(task)
      return
    }

    logger.log('updating task job')
    updateJob(task.lastjob, data)
  },
  create (task, taskArgs) {
    logger.log('creating new job with task %o', task)

    XHR.send({
      method: 'post',
      url: `${config.api_url}/job`,
      withCredentials: true,
      jsonData: { task: task.id, task_arguments: taskArgs },
      timeout: 5000,
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
  cancel (task) {
    const job = task.lastjob
    XHR.send({
      method: 'put',
      url: `${config.api_url}/job/${job.id}/cancel`,
      withCredentials: true,
      timeout: 5000,
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done (data,xhr) {
        logger.debug('job canceled')
        task.lastjob.clear()
        task.lastjob.result.clear()
        task.lastjob.set('lifecycle',LIFECYCLE.CANCELED)
      },
      fail (err,xhr) {
        bootbox.alert('something goes wrong')
        console.log(arguments)
      }
    })
  }
}
