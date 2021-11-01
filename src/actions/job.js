
import App from 'ampersand-app'
import XHR from 'lib/xhr'
import * as OperationsConstants from 'constants/operations'
import * as TaskConstants from 'constants/task'
import * as LifecycleConstants from 'constants/lifecycle'
import * as JobConstants from 'constants/job'
import qs from 'qs'
import bootbox from 'bootbox'

import loggerModule from 'lib/logger'
const logger = loggerModule('actions:jobs')

export default {
  /**
   *
   * @summary this is being updated via socket event
   * @param {Object} topicEvent
   *
   */
  applyStateUpdate (topicEvent) {
    try {
      const job = addJobToState(topicEvent.model)

      /**
       * @summary check if job is on hold and requires intervention of the current user
       */
      if (job) {
        if (job._type !== 'WorkflowJob') {
          if (job.requiresInteraction()) {
            App.actions.onHold.check(job)
          }

          handleJobCompletedEvent(job, topicEvent)
        }
      }
    } catch (e) {
      console.error(e)
    }
  },
  fetch (id) {
    const job = App.state.jobs.get(id)
    if (!job) { return }
    job.fetch()
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
  create (task, args) {
    const values = parseArgumentsValues(task, args)
    if (!task.workflow_id) {
      logger.debug('creating new job with task %o', task)
      createSingleTaskJob(task, values, (err, job) => { })
    } else {
      let workflow = App.state.workflows.get(task.workflow_id)
      logger.debug('creating new job with workflow %o', workflow)
      createWorkflowJob(workflow, values, (err, job) => { })
    }
  },
  submitInputs (job, args = null) {
    const values = parseArgumentsValues(job.task, args)

    XHR.send({
      method: 'put',
      url: `${job.url()}/input`,
      jsonData: { args: values },
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      fail (err, xhr) {
        App.state.alerts.danger('something goes wrong')
      }
    })
  },
  restart (job, args = null) {
    const values = parseArgumentsValues(job.task, args)

    XHR.send({
      method: 'put',
      url: `${job.url()}/restart`,
      jsonData: { task_arguments: values },
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      fail (err, xhr) {
        App.state.alerts.danger('something goes wrong')
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
            //updateInprogressCounter(job, model, OperationsConstants.DELETE)
          }
        }
      },
      fail (err, xhr) {
        App.state.alerts.danger('Something goes wrong. Please reload the App')
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
  },
  getParticipants (jobId) {
    const job = App.state.jobs.get(jobId)

    XHR.send({
      method: 'get',
      url: `${job.urlV2()}/participants`,
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done (data,xhr) {
        job.owner = data.owner
        job.assignee = data.assignee
        job.observers = data.observers
      },
      fail (err,xhr) {
        App.state.alerts.danger('something goes wrong')
        console.log(arguments)
      }
    })
  },
  getRunningJobs () {
    XHR.send({
      method: 'get',
      url: `${App.Models.Job.Collection.prototype.url('v2')}/running`,
      withCredentials: true,
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done (jobs, xhr) {
        for (let job of jobs) {
          // add job to state
          addJobToState(job)
        }
      }
    })
  },
  //getRunningJobsCounter () {
  //  XHR.send({
  //    method: 'get',
  //    url: `${App.Models.Job.Collection.prototype.url('v2')}/running_count`,
  //    withCredentials: true,
  //    headers: {
  //      Accept: 'application/json;charset=UTF-8'
  //    },
  //    done (jobsAccum, xhr) {
  //      for (let accum of jobsAccum) {
  //        if (accum.workflow_id) {
  //          const workflow = App.state.workflows.get(accum.workflow_id)
  //          if (workflow) {
  //            workflow.inProgressJobs = accum.count
  //          }
  //        } else if (accum.task_id) {
  //          const task = App.state.tasks.get(accum.task_id)
  //          if (task) {
  //            task.inProgressJobs = accum.count
  //          }
  //        }
  //      }
  //    }
  //  })
  //},
  changeAssignee (jobId, assignee) {
    const job = App.state.jobs.get(jobId)
    if (!job) {
      bootbox.alert('Failed to find job, please reload the page')
    } else {
      XHR.send({
        method: 'put',
        url: `${job.urlV2()}/assignee`,
        jsonData: assignee,
        headers: {
          Accept: 'application/json;charset=UTF-8'
        },
        done (data, xhr) {
          job.assignee = data.assignee
          App.state.alerts.info('Changed assignee')
        },
        fail (err, xhr) {
          App.state.alerts.danger('Failed to change assignee')
        }
      })
    }
  }
}

const createSingleTaskJob = (task, args, next) => {
  const body = { task_arguments: args }

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
      next(err)
    }
  })
}

const createWorkflowJob = (workflow, args, next) => {
  const body = { task_arguments: args }

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
      next(err)
    }
  })
}

const addJobToState = (data) => {
  if (data._type === 'WorkflowJob') {
    return addWorkflowJobToState(data)
  } else {
    return addTaskJobToState(data)
  }
}

const addWorkflowJobToState = (data) => {
  let workflow = App.state.workflows.get(data.workflow_id)
  if (!workflow) {
    logger.error('workflow not found in state')
    logger.error('%o', data)
    return
  }
  // workflow job created
  return workflow.jobs.add(data, { merge: true })
}

const addTaskJobToState = (props) => {
  // task definition not in state
  const task = App.state.tasks.get(props.task_id)
  if (!task) {
    logger.error('task not found in state')
    logger.error('%o', props)
    return
  }

  const taskJob = new App.Models.Job.Factory(props, {})

  if (!task.workflow_id) {
    //
    // single task job. not workflow
    //
    task.jobs.add(taskJob, { merge: true })
    //updateInprogressCounter(taskJob, task, operation)
  } else {
    // 
    // Job belong to a workflow
    // 
    // get the workflow
    const workflow = App.state.workflows.get(task.workflow_id)
    if (!workflow) { // error
      const err = new Error('workflow job not found')
      err.props = props 
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
    //updateInprogressCounter(taskJob, workflow, operation)
  }

  if (
    task.hasOnHoldExecution &&
    taskJob.lifecycle === LifecycleConstants.READY
  ) {
    App.actions.scheduler.fetch(task)
  }

  return taskJob
}

const parseArgumentsValues = (task, args) => {
  if (!args) { return [] }

  // new legacy behaviour
  if (task.arguments_type === TaskConstants.ARGUMENT_TYPE_LEGACY) {
    return args.map(arg => getValue(arg)) // API behaviour
  }

  if (task.arguments_type === TaskConstants.ARGUMENT_TYPE_JSON) {
    return mapAsJSON(args)
  }

  // map as text
  return mapAsString(args)
}

const getValue = (arg) => {
  if (arg.type === 'file') {
    return arg.value?.dataUrl
  }
  if (arg.type === 'date') {
    return (Array.isArray(arg.value) && arg.value[0])
  }
  return (arg.value || '')
}

//
// convert each argument into a JSON string
//
const mapAsJSON = (args) => {
  return args.map(arg => {
    let value
    if (arg.type === 'json') {
      value = convertToObject(getValue(arg))
    } else {
      value = getValue(arg)
    }

    if (value === null) {
      if (arg.hasOwnProperty('default')) {
        return arg.default
      } else {
        return null
      }
    }

    return value
  })
}

const convertToObject = (value) => {
  if (typeof value !== 'string') {
    return value
  }

  try {
    return JSON.parse(value)
  } catch (err) {
    return null // default null ???
  }
}

//
// everything should be a string
//
const mapAsString = (args) => {
  return args.map(arg => {
    let value = convertToString(getValue(arg))
    if (value === "") {
      if (arg.hasOwnProperty('default')) {
        return arg.default
      } else {
        return ""
      }
    }

    return value
  })
}

const convertToString = (value) => {
  if (typeof value === 'string') {
    return value
  }

  if (value === undefined) {
    return ""
  }

  try {
    return JSON.stringify(value)
  } catch (err) {
    return "" // default empty string ??
  }
}

const handleJobCompletedEvent = (job, topicEvent) => {

  if (!LifecycleConstants.isCompleted(job.lifecycle)) { return }
  if (job.task.show_result !== true) { return }

  const session = App.state.session
  if (job.isAssigned()) {
    if (!job.isAssignee(session.user)) {
      return
    }
  } else if (!job.isOwner(session.user)) {
    return
  }

  /**
   *
   * job.output is an array of arguments
   *
   */
  let popupContent
  // search on output for backwards compatibility
  const output = job.output.map(arg => {
    try {
      return JSON.parse(arg)
    } catch (e) {
      logger.error(e.message)
      return arg
    }
  })

  const popup = output.find(out => out && out.popup_component)
  if (popup) {
    popupContent = popup.popup_component
  }

  // search on result compoment
  if (job.result.components && job.result.components.popup) {
    popupContent = job.result.components.popup
  }

  if (popupContent) {
    App.actions.popup.show(popupContent, `Message from ${job.name}`)
  }
}
