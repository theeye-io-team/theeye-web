
'use strict'

import App from 'ampersand-app'
import * as TaskConstants from 'constants/task'
import * as LifecycleConstants from 'constants/lifecycle'
import * as JobConstants from 'constants/job'
import { ExecOnHoldJob } from 'view/page/dashboard/task/task/collapse/job/exec-job'
import { eachSeries, each } from 'async'

export default {
  skip (job) {
    job.skip = true
  },
  check (job) {
    if (App.state.onHold.underExecution === true) {
      App.state.onHold.newArrived = true
    } else {
      checkOnHold(job)
    }
  },
  release () {
    App.state.onHold.newArrived = false
    App.state.onHold.underExecution = false
  }
}

const checkOnHold = (job) => {
  if (job) {
    // execute on a single job
    executeOnHoldJobs([job])
  } else {
    // search for approval task to check
    const tasksToCheck = App.state.tasks.models.filter(task => {
      let check = (
        task.type === TaskConstants.TYPE_APPROVAL || (
          task.type === TaskConstants.TYPE_SCRIPT &&
          task.user_inputs === true
        )
      )
      return check
    })

    if (tasksToCheck.length === 0) {
      return App.actions.onHold.release()
    }

    checkTasks(tasksToCheck)
  }
}

const checkTasks = (tasks) => {
  each(tasks, (task, done) => {
    task.fetchJobs({
      forceFetch: true,
      query: { lifecycle: LifecycleConstants.ONHOLD }
    }, done)
  }, (err) => {
    if (err) {
      logger.error(err)
      App.actions.onHold.release()
    }

    let onHoldJobs = []
    tasks.forEach(task => {
      const jobs = task.jobs.models
      jobs.forEach(job => {
        const user = App.state.session.user
        if (!job.skip && job.requiresUserInteraction(user)) {
          onHoldJobs.push(job)
        }
      })
    })

    if (onHoldJobs.length === 0) {
      App.actions.onHold.release()
    } else {
      executeOnHoldJobs(onHoldJobs)
    }
  })
}

const executeOnHoldJobs = (jobs) => {
  App.state.onHold.underExecution = true
  eachSeries(jobs, function (job, done) {
    job.fetch({
      success: () => {
        var execOnHoldJob = new ExecOnHoldJob({model: job})
        execOnHoldJob.execute(true, done)
      }
    })
  }, function (err) {
    if (App.state.onHold.newArrived) {
      App.state.onHold.newArrived = false
      checkOnHold()
    } else {
      App.actions.onHold.release()
    }
  })
}
