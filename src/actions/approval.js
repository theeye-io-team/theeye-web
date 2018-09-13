
'use strict'

import App from 'ampersand-app'
import TaskConstants from 'constants/task'
import LifecycleConstants from 'constants/lifecycle'
import { ExecApprovalJob } from 'view/page/dashboard/task/task/collapse/job/exec-job'
import { eachSeries, each } from 'async'

module.exports = {
  skip (job) {
    job.skip = true
  },
  check (job) {
    if (App.state.approval.underExecution === true) {
      App.state.approval.newArrived = true
    } else {
      this.checkPendingApprovals(job)
    }
  },
  checkPendingApprovals (job) {
    var self = this

    const finish = function () {
      App.state.approval.newArrived = false
      App.state.approval.underExecution = false
    }

    const executePendingApprovalJobs = function (pendingApprovalJobs) {
      App.state.approval.underExecution = true
      eachSeries(pendingApprovalJobs, function (job, done) {
        var execApprovalJob = new ExecApprovalJob({model: job})
        execApprovalJob.execute(true, done)
      }, function (err) {
        if (App.state.approval.newArrived) {
          App.state.approval.newArrived = false
          self.checkPendingApprovals()
        } else {
          finish()
        }
      })
    }

    let pendingApprovalJobs = []
    const userTasksToApprove = App.state.tasks.models.filter((task) => {
      let check = (
        task.type === TaskConstants.TYPE_APPROVAL &&
        task.isApprover(App.state.session.user.id)
      )
      return check
    })

    if (userTasksToApprove.length === 0) {
      finish()
      return
    }

    if (job) {
      pendingApprovalJobs.push(job)
      executePendingApprovalJobs(pendingApprovalJobs)
    } else {
      each(userTasksToApprove, function (task, done) {
        task.fetchJobs({
          forceFetch: true,
          query: { lifecycle: LifecycleConstants.ONHOLD }
        }, done)
      }, function (err) {
        if (err) {
          finish()
          return
        }

        userTasksToApprove.forEach(function (task) {
          task.jobs.models.forEach(function (job) {
            if (job.lifecycle === LifecycleConstants.ONHOLD && !job.skip) {
              pendingApprovalJobs.push(job)
            }
          })
        })

        if (!pendingApprovalJobs.length) {
          finish()
          return
        } else {
          executePendingApprovalJobs(pendingApprovalJobs)
        }
      })
    }
  }
}
