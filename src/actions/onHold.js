
'use strict'

import App from 'ampersand-app'
import TaskConstants from 'constants/task'
import LifecycleConstants from 'constants/lifecycle'
import JobConstants from 'constants/job'
import { ExecOnHoldJob } from 'view/page/dashboard/task/task/collapse/job/exec-job'
import { eachSeries, each } from 'async'

module.exports = {
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
    const userTasksToCheck = App.state.tasks.models.filter(task => {
      let check = (
        task.type === TaskConstants.TYPE_APPROVAL &&
        task.isApprover(App.state.session.user)
      ) || task.type === TaskConstants.TYPE_SCRIPT

      return check
    })

    if (userTasksToCheck.length === 0) {
      App.actions.onHold.release()
      return
    }

    checkUserTasks(userTasksToCheck, err => {
      App.actions.onHold.release()
    })
  }
}

const executeOnHoldJobs = (onHoldJobs) => {
  App.state.onHold.underExecution = true
  eachSeries(onHoldJobs, function (job, done) {
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

const checkUserTasks = (userTasksToCheck, callback) => {
  let onHoldJobs = []
  each(userTasksToCheck, (task, done) => {
    task.fetchJobs({
      forceFetch: true,
      query: { lifecycle: LifecycleConstants.ONHOLD }
    }, done)
  }, err => {
    if (err) { return callback(err) }

    userTasksToCheck.forEach(task => {
      task.jobs.models.forEach(job => {
        if (job.lifecycle === LifecycleConstants.ONHOLD && ! job.skip) {
          if (job._type === JobConstants.APPROVAL_TYPE) {
            onHoldJobs.push(job)
          } else if (job._type === JobConstants.SCRIPT_TYPE && job.workflow_job_id) {
            if (job.isOwner(App.state.session.user)) {
              onHoldJobs.push(job)
            }
          }
        }
      })
    })

    if (onHoldJobs.length === 0) {
      return callback()
    } else {
      executeOnHoldJobs(onHoldJobs)
    }
  })
}
