import bootbox from 'bootbox'
import App from 'ampersand-app'
import * as TaskConstants from 'constants/task'
import * as LifecycleConstants from 'constants/lifecycle'
import { ExecOnHoldJob } from 'view/page/dashboard/task/task/collapse/job/exec-job'

export default {
  /**
   * @summary check if job is on hold and requires intervention
   * of the current user
   */
  check (job = null, forced = false) {
    if (job) {
      if (job.requiresInteraction() || forced===true) {
        if (App.state.onHold.underExecution === true) {
          holdJob(job)
        } else {
          // execute on a single job
          controlPendingJobsIteration([job])
        }
      }
    } else {
      // if (App.state.onHold.underExecution !== true) {
      //   checkOnHold() // check all
      // }
    }
  },
  checkWorkflow (workflow) {
    if (App.state.onHold.underExecution !== true) {
      workflow
        .fetchJobs()
        .then(() => {
          checkWorkflow(workflow)
        })
    } else {
      console.error('bussy checking')
    }
  },
  checkTask (task) {
    if (App.state.onHold.underExecution !== true) {
      task.fetchJobs(() => {
        checkTask(task)
      })
    } else {
      console.error('bussy checking')
    }
  },
  release () {
    App.state.onHold.newArrived = false
    App.state.onHold.underExecution = false
    App.state.onHold.queue = []
  }
}

const holdJob = (job) => {
  App.state.onHold.newArrived = true
  App.state.onHold.queue.push(job)
}

const checkWorkflow = (workflow) => {
  const workflowJobs = workflow.jobs.models
  const jobs = []

  for (let wfIndex = 0; wfIndex < workflowJobs.length; wfIndex++) {
    const workflowJob = workflowJobs[wfIndex]
    if (workflowJob.requiresInteraction()) {
      // if workflow job requires interaction,
      // we only need to know the active job
      jobs.push(workflowJob.current_job)
    }
  }

  if (jobs.length === 0) {
    nothingToDo()
  } else {
    controlPendingJobsIteration(jobs)
  }
}

const checkTask = (task) => {
  const jobs = task.jobs.models.filter(job => job.requiresInteraction())
  if (jobs.length === 0) {
    nothingToDo()
  } else {
    controlPendingJobsIteration(jobs)
  }
}

const controlPendingJobsIteration = (jobs) => {
  App.state.onHold.underExecution = true
  iteratePendingJobs(jobs, 0, (err) => {
    // if err ?
    if (App.state.onHold.newArrived === true) {
      App.state.onHold.newArrived = false
      iteratePendingJobs(App.state.onHold.queue, 0, () => {
        App.actions.onHold.release()
      })
    } else {
      App.actions.onHold.release()
    }
  })
}

const iteratePendingJobs = (taskJobs, currIndex, endRecursion) => {
  if (taskJobs.length === 0) {
    return endRecursion()
  }
  if (currIndex >= taskJobs.length) {
    return endRecursion()
  }

  const job = taskJobs[currIndex]
  if (!job) {
    return endRecursion(new Error('job is undefined'))
  }

  job.fetch({
    success () {
      const execOnHoldJob = new ExecOnHoldJob({ model: job })
      execOnHoldJob.execute(() => {
        iteratePendingJobs(taskJobs, currIndex + 1, endRecursion)
      })
    },
    failure (err) {
      endRecursion(new Error('failed to fetch job state'))
    }
  })
}

const nothingToDo = () => {
  bootbox.alert('You have no pending actions.')
}

//const checkOnHold = () => {
//  // search for holded jobs to check
//  const tasksToCheck = App.state.tasks.models.filter(task => {
//    return (
//      task.type === TaskConstants.TYPE_APPROVAL || (
//        task.type === TaskConstants.TYPE_SCRIPT &&
//        task.user_inputs === true
//      )
//    )
//  })
//
//  if (tasksToCheck.length === 0) {
//    return App.actions.onHold.release()
//  }
//
//  checkTasks(tasksToCheck)
//}

//const checkTasks = (tasks) => {
//  const promises = []
//
//  for (let task of tasks) {
//    promises.push(
//      new Promise((resolve, reject) => {
//        task.fetchJobs({
//          forceFetch: true,
//          query: { lifecycle: LifecycleConstants.ONHOLD }
//        }, err => {
//          if (err) return reject(err)
//          else resolve()
//        })
//      })
//    )
//  }
//
//  Promise
//    .all(promises)
//    .then(() => {
//      const jobsToCheck = []
//      for (let task of tasks) {
//        task.jobs.models.forEach(job => {
//          if (!job.skipInputs && job.requiresInteraction()) {
//            jobsToCheck.push(job)
//          }
//        })
//      }
//
//      if (jobsToCheck.length === 0) {
//        App.actions.onHold.release()
//      } else {
//        controlPendingJobsIteration(jobsToCheck)
//      }
//    })
//    .catch(fetchErr => {
//      logger.error(fetchErr)
//      App.actions.onHold.release()
//    })
//}
