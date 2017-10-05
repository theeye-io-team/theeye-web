'use strict'

import App from 'ampersand-app'
import XHR from 'lib/xhr'
import bootbox from 'bootbox'
const logger = require('lib/logger')('actions:jobs')
const config = require('config')
import LIFECYCLE from 'constants/lifecycle'

module.exports = {
  update (job) {
    logger.log('job updates received')

    const task_id = job.task_id

    const task = App.state.tasks.get(task_id)
    if (!task) {
      logger.error('task not found')
      logger.error(task)
      return
    }

    logger.log('updating task job')
    task.lastjob.set(job)
  },
  create (task) {
    logger.log('creating new job with task %o', task)

    XHR.send({
      method: 'post',
      url: `${config.api_url}/job`,
      withCredentials: true,
      jsonData: { task: task.id },
      timeout: 5000,
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done (data,xhr) {
        logger.debug('job created. updating task')
        task.lastjob.clear()
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
      withCredentials: true,
      timeout: 5000,
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done (data,xhr) {
        logger.debug('job canceled')
        task.lastjob.set('lifecycle',LIFECYCLE.CANCELED)
      },
      fail (err,xhr) {
        bootbox.alert('something goes wrong')
        console.log(arguments)
      }
    })
  }
}
