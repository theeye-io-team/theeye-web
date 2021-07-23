import bootbox from 'bootbox'
import App from 'ampersand-app'
import * as TaskConstants from 'constants/task'
import * as LifecycleConstants from 'constants/lifecycle'
import * as JobConstants from 'constants/job'
import { ExecOnHoldJob } from 'view/page/dashboard/task/task/collapse/job/exec-job'

export default {
  skip (job) {
    job.skipInputs = true
  },
  check (job = null) {
    if (App.state.onHold.underExecution === true) {
      App.state.onHold.newArrived = true
    } else {
      if (job) {
        // execute on a single job
        controlPendingJobsIteration([ job ])
      } else {
        //checkOnHold()
      }
    }
  },
  checkWorkflow (workflow) {
    if (App.state.onHold.underExecution === true) {
      App.state.onHold.newArrived = true
    } else {
      checkWorkflow(workflow)
    }
  },
  checkTask (task) {
    if (App.state.onHold.underExecution === true) {
      App.state.onHold.newArrived = true
    } else {
      checkTask(task)
    }
  },
  release () {
    App.state.onHold.newArrived = false
    App.state.onHold.underExecution = false
  }
}

const checkOnHold = () => {
  // search for holded jobs to check
  const tasksToCheck = App.state.tasks.models.filter(task => {
    return (
      task.type === TaskConstants.TYPE_APPROVAL || (
        task.type === TaskConstants.TYPE_SCRIPT &&
        task.user_inputs === true
      )
    )
  })

  if (tasksToCheck.length === 0) {
    return App.actions.onHold.release()
  }

  checkTasks(tasksToCheck)
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
    return endRecursion( new Error('job is undefined') )
  }

  job.fetch({
    success () {
      const execOnHoldJob = new ExecOnHoldJob({ model: job })
      execOnHoldJob.execute(true, () => {
        iteratePendingJobs(taskJobs, currIndex + 1, endRecursion)
      })
    },
    failure (err) {
      endRecursion( new Error('failed to fetch job state') )
    }
  })
}

const controlPendingJobsIteration = (jobs) => {
  App.state.onHold.underExecution = true

  iteratePendingJobs(jobs, 0, (err) => {
    // if err ?
    if (App.state.onHold.newArrived === true) {
      App.state.onHold.newArrived = false
      checkOnHold()
    } else {
      App.actions.onHold.release()
    }
  })
}

const checkWorkflow = (workflow) => {
  const workflowJobs = workflow.jobs.models
  const jobs = []

  for (let wfIndex = 0; wfIndex < workflowJobs.length; wfIndex++) {
    const workflowJob = workflowJobs[wfIndex]
    if (workflowJob.requiresInteraction() || workflowJob.lifecycle == "onhold") {
      // if workflow job requires interaction, we only need to know the active job
      const currentJob = workflowJob.current_job
      //if (!currentJob.skipInputs) {
        jobs.push(currentJob)
      //}
    }
  }

  if (jobs.length === 0) {
    nothingToDo()
  } else {
    controlPendingJobsIteration(jobs)
  }
}

const checkTask = (task) => {
  //const jobs = task.jobs.models.filter(job => !job.skipInputs && job.requiresInteraction())
  const jobs = task.jobs.models.filter(job => job.requiresInteraction())
  if (jobs.length === 0) {
    nothingToDo()
  } else {
    controlPendingJobsIteration(jobs)
  }
}

const nothingToDo = () => {
  bootbox.alert('You have no pending actions.')
}

const checkTasks = (tasks) => {
  const promises = []

  for (let task of tasks) {
    promises.push(
      new Promise( (resolve, reject) => {
        task.fetchJobs({
          forceFetch: true,
          query: { lifecycle: LifecycleConstants.ONHOLD }
        }, err => {
          if (err) return reject(err)
          else resolve()
        })
      })
    )
  }

  Promise
    .all(promises)
    .then(() => {
      const jobsToCheck = []
      for (let task of tasks) {
        task.jobs.models.forEach(job =>  {
          if (!job.skipInputs && job.requiresInteraction()) {
            jobsToCheck.push(job)
          }
        })
      }

      if (jobsToCheck.length === 0) {
        App.actions.onHold.release()
      } else {
        controlPendingJobsIteration(jobsToCheck)
      }
    })
    .catch(fetchErr => {
      logger.error(fetchErr)
      App.actions.onHold.release()
    })
}
