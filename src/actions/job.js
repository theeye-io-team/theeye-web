
import App from 'ampersand-app'
import XHR from 'lib/xhr'
import * as TaskConstants from 'constants/task'
import * as LifecycleConstants from 'constants/lifecycle'
import * as JobConstants from 'constants/job'
import qs from 'qs'

import loggerModule from 'lib/logger'
const logger = loggerModule('actions:jobs')

export default {
  /**
   *
   * @summary this is being updated via socket event
   * @param {Object} data job model properties
   *
   */
  applyStateUpdate (data) {
    try {
      let workflow
      if (data._type === 'WorkflowJob') {
        // update state
        return addWorkflowJobToState(data)
      }

      // task definition not in state
      const task = App.state.tasks.get(data.task_id)
      if (!task) {
        logger.error('task not found in state')
        logger.error('%o', data)
        return
      }

      const job = addJobToState(data, task)

      /**
       * @summary check if job is on hold and requires intervention of the current user
       */
      const user = App.state.session.user
      if (job.requiresUserInteraction(user)) {
        App.actions.onHold.check(job)
      }
    } catch (e) {
      console.error(e)
    }
  },
  /**
   *
   *
   *
   */
  createFromTask (task, args) {
    if (task.arguments_type === 'json' && args.length > 0) {
      for (let index = 0; index < args.length; index++) {
        let arg = args[index]
        try {
          // submit json values instead of strings
          args[index] = JSON.parse(arg.value)
        } catch (err) {
          logger.warn(`cannot json.parse ${arg.value}`)
          // ok
        }
      }
    }

    if (!task.workflow_id) {
      logger.log('creating new job with task %o', task)
      createSingleTaskJob(task, args, (err, job) => { })
    } else {
      let workflow = App.state.workflows.get(task.workflow_id)
      logger.log('creating new job with workflow %o', workflow)
      createWorkflowJob(workflow, args, (err, job) => { })
    }
  },
  cancel (job) {
    job.set('lifecycle', LifecycleConstants.CANCELED)
    XHR.send({
      method: 'put',
      url: `${job.url()}/cancel`,
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done (data,xhr) {
        logger.debug('job canceled')
      },
      fail (err,xhr) {
        App.state.alerts.danger('something goes wrong')
        console.log(arguments)
      }
    })
  },
  approve (job, args) {
    args || (args = [])
    job.set('lifecycle', LifecycleConstants.FINISHED)
    XHR.send({
      method: 'put',
      url: `${job.url()}/approve`,
      //jsonData: { args },
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done (data,xhr) {
        logger.debug('job approved')
      },
      fail (err,xhr) {
        App.state.alerts.danger('something goes wrong')
        console.log(arguments)
      }
    })
  },
  reject (job, args) {
    args || (args = [])
    job.set('lifecycle', LifecycleConstants.FINISHED)
    XHR.send({
      method: 'put',
      url: `${job.url()}/reject`,
      //jsonData: { args },
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done (data,xhr) {
        logger.debug('job rejected')
      },
      fail (err,xhr) {
        App.state.alerts.danger('something goes wrong')
        console.log(arguments)
      }
    })
  },
  submitInputs (job, args) {
    args || (args = [])
    //job.set('lifecycle', LifecycleConstants.FINISHED)
    XHR.send({
      method: 'put',
      url: `${job.url()}/input`,
      jsonData: { args },
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done (data, xhr) {
        logger.debug('job inputs submited')
      },
      fail (err, xhr) {
        App.state.alerts.danger('something goes wrong')
        console.log(arguments)
      }
    })
  },
  restart (job, args) {
    args || (args = [])
    //job.set('lifecycle', LifecycleConstants.FINISHED)
    XHR.send({
      method: 'put',
      url: `${job.url()}/restart`,
      jsonData: { task_arguments: args },
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done (data, xhr) {
        logger.debug('job inputs submited')
      },
      fail (err, xhr) {
        App.state.alerts.danger('something goes wrong')
        console.log(arguments)
      }
    })
  },
  /**
   * model should be a workflow or a task
   */
  cleanQueue (model, query) {
    query || (query = {})
    XHR.send({
      method: 'delete',
      url: `${model.url()}/job?${qs.stringify(query)}`,
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done (data, xhr) {
        let jobs = model.jobs.models
        for (let index = jobs.length - 1; index >=0; index--) {
          let job = jobs[index]
          // not inProgress jobs are always removed from the queue.
          // also check is job.lifecycle was also included in the query
          if (
            ! LifecycleConstants.inProgress(job.lifecycle) ||
            ( query.lifecycle && query.lifecycle.indexOf(job.lifecycle) !== -1 )
          ) {
            model.jobs.remove(job.id)
          }
        }
      },
      fail (err, xhr) {
        App.state.alerts.danger('Something goes wrong. Please try again later')
      }
    })
  },
  fillUser (job) {
    const userId = job.user_id
    if (userId) {
      const member = App.state.members.models.find(m => m.user.id === userId)
      if (member) {
        job.user.set( member.user._values )
      }
    }
  }
}

const createSingleTaskJob = (task, args, next) => {
  let body = {
    task: task.id,
    task_arguments: args
  }

  XHR.send({
    method: 'POST',
    url: `${task.url()}/job`,
    jsonData: body,
    headers: {
      Accept: 'application/json;charset=UTF-8'
    },
    done (data, xhr) {
      logger.debug('job created. updating task')
      if (task.grace_time > 0) {
        App.actions.scheduler.fetch(task)
      } else {
        let job = task.jobs.add(data, { merge: true })
      }
      next(null, data)
    },
    fail (err,xhr) {
      App.state.alerts.danger('Job creation failed')
      console.log(arguments)
      next(err)
    }
  })
}

const createWorkflowJob = (workflow, args, next) => {
  const body = {
    task: workflow.start_task_id,
    task_arguments: args
  }

  XHR.send({
    method: 'POST',
    url: `${workflow.url()}/job`,
    jsonData: body,
    headers: {
      Accept: 'application/json;charset=UTF-8'
    },
    done (data, xhr) {
      logger.debug('job created. updating workflow')
      //wait for socket update arrive and create there
      let job = workflow.jobs.add(data, { merge: true })
      next(null, data)
    },
    fail (err,xhr) {
      App.state.alerts.danger('Job creation failed')
      console.log(arguments)
      next(err)
    }
  })
}

const addWorkflowJobToState = (data) => {
  let workflow = App.state.workflows.get(data.workflow_id)
  if (!workflow) {
    logger.error('workflow not found in state')
    logger.error('%o', data)
    return
  }
  // workflow job created
  workflow.jobs.add(data, { merge: true })
}

const addJobToState = (data, task) => {
  let taskJob = new App.Models.Job.Factory(data, {})

  if (!task.workflow_id) {
    task.jobs.add(taskJob, { merge: true })
  } else {
    // get the workflow
    let workflow = App.state.workflows.get(task.workflow_id)
    if (!workflow) { // error
      let err = new Error('workflow job not found')
      err.data = data
      throw err
    }

    // get the workflow job
    let workflowJob = workflow.jobs.get(taskJob.workflow_job_id)
    if (!workflowJob) { // async error ?
      if (!taskJob.workflow_job_id) {
        throw new Error('task definition error. workflow id is missing')
      }

      // add temp models to the collection
      let attrs = {
        id: taskJob.workflow_job_id,
        _type: JobConstants.WORKFLOW_TYPE
      }
      workflowJob = workflow.jobs.add(attrs, { merge: true })
    }

    workflowJob.jobs.add(taskJob, { merge: true })
  }

  if (
    task.hasOnHoldExecution &&
    data.lifecycle === LifecycleConstants.READY
  ) {
    App.actions.scheduler.fetch(task)
  }

  return taskJob
}
