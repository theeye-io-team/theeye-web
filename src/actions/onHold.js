
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
      this.checkOnHold(job)
    }
  },
  checkOnHold (job) {
    var self = this

    const finish = function () {
      App.state.onHold.newArrived = false
      App.state.onHold.underExecution = false
    }

    const executeOnHoldJobs = function (onHoldJobs) {
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
          self.checkOnHold()
        } else {
          finish()
        }
      })
    }

    let onHoldJobs = []

    if (job) {
      // si tengo un job inicio la execucion
      onHoldJobs.push(job)
      executeOnHoldJobs(onHoldJobs)
    } else {
      // si no tengo un job actual, busco pendientes

      // busco tareas de aprobacion
      const userTasksToCheck = App.state.tasks.models.filter((task) => {
        let check = (
          task.type === TaskConstants.TYPE_APPROVAL &&
          task.isApprover(App.state.session.user.id)
        ) || task.type === TaskConstants.TYPE_DUMMY
        return check
      })

      if (userTasksToCheck.length === 0) {
        finish()
        return
      }

      each(userTasksToCheck, function (task, done) {
        task.fetchJobs({
          forceFetch: true,
          query: { lifecycle: LifecycleConstants.ONHOLD }
        }, done)
      }, function (err) {
        if (err) {
          finish()
          return
        }

        userTasksToCheck.forEach(function (task) {
          task.jobs.models.forEach(function (job) {
            if (job.lifecycle === LifecycleConstants.ONHOLD && !job.skip) {
              // si es de tipo dummy verifico que sea el owner del workflowjob
              if (job._type === JobConstants.DUMMY_TYPE && job.workflow_job_id) {
                const workflowJob = App.state.jobs.get(job.workflow_job_id)
                if (workflowJob.isOwner(App.state.session.user.email)) {
                  onHoldJobs.push(job)
                }
              } else {
                onHoldJobs.push(job)
              }
            }
          })
        })

        if (!onHoldJobs.length) {
          finish()
          return
        } else {
          executeOnHoldJobs(onHoldJobs)
        }
      })
    }
  }
}
