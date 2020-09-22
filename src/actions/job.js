
import App from 'ampersand-app'
import XHR from 'lib/xhr'
import bootbox from 'bootbox'
import * as TaskConstants from 'constants/task'
import * as LifecycleConstants from 'constants/lifecycle'
import * as JobConstants from 'constants/job'
import { ExecOnHoldJob } from 'view/page/dashboard/task/task/collapse/job/exec-job'
import { eachSeries, each } from 'async'
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

      const taskJob = addTaskJobToState(data, task)
      isOnHoldUpdate(taskJob)
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
        bootbox.alert('something goes wrong')
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
        bootbox.alert('something goes wrong')
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
        bootbox.alert('something goes wrong')
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
        bootbox.alert('something goes wrong')
        console.log(arguments)
      }
    })
  },
  //removeFinished (model) {
  //  XHR.send({
  //    method: 'delete',
  //    url: `${model.url()}/job?lifecycle=finished`,
  //    headers: {
  //      Accept: 'application/json;charset=UTF-8'
  //    },
  //    done (data, xhr) {
  //      let deletedJobs = []
  //      model.jobs.forEach(job => {
  //        if (!LifecycleConstants.inProgress(job.lifecycle)) {
  //          deletedJobs.push(job.id)
  //        }
  //      })
  //      deletedJobs.forEach(jobId => {
  //        model.jobs.remove(jobId)
  //      })
  //    },
  //    fail (err, xhr) {
  //      bootbox.alert('Something goes wrong. Please try again later')
  //    }
  //  })
  //},
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
        bootbox.alert('Something goes wrong. Please try again later')
      }
    })
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
      bootbox.alert('Job creation failed')
      console.log(arguments)
      next(err)
    }
  })
}

const createWorkflowJob = (workflow, args, next) => {
  let body = {
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
      bootbox.alert('Job creation failed')
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

const addTaskJobToState = (data, task) => {
  let taskJob = new App.Models.Job.Factory(data, {})

  if (!task.workflow_id) {
    task.jobs.add(taskJob, { merge: true })
  } else {
    // get the workflow
    let workflow = App.state.workflows.get(task.workflow_id)
    if (!workflow) { // error
      let err = new Error(msg)
      err.data = data
      throw err
    }

    // get the workflow job
    let workflowJob = workflow.jobs.get(taskJob.workflow_job_id)
    if (!workflowJob) { // async error?
      if (!taskJob.workflow_job_id) {
        throw new Error('task definition error. workflow id is missing')
      }
      // add temp models to the collection
      let attrs = {
        id: taskJob.workflow_job_id,
        type: JobConstants.WORKFLOW_TYPE
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

/**
 *
 * @summary check if job is on hold and requires intervention from user
 *
 * @param {Object} job object model properties
 *
 */
const isOnHoldUpdate = (job) => {
  if (job.lifecycle !== LifecycleConstants.ONHOLD) {
    return
  }

  const user = App.state.session.user

  if (job._type === JobConstants.APPROVAL_TYPE) {
    if (job.isApprover(user)) {
      App.actions.onHold.check(job)
    }
  } else {
    if (job.requireUserInteraction(user)) {
      App.actions.onHold.check(job)
    }
  }
}
