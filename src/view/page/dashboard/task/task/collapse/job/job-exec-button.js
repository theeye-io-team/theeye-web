import View from 'ampersand-view'
import LifecycleConstants from 'constants/lifecycle'
import JobConstants from 'constants/job'
import StateConstants from 'constants/states'
import { ExecJob, ExecApprovalJob } from './exec-job.js'
import JobResult from 'view/page/dashboard/job-result'

module.exports = View.extend({
  template: `
    <li class="task-exec-button">
      <button
        class="ladda-button btn btn-primary tooltiped"
        data-hook="action_button"
        data-spinner-size="30"
        data-style="zoom-in">
        <i data-hook="action_button_icon" aria-hidden="true"></i>
        <i data-hook="job_lifecycle" style="top:-6px;position:relative;right:4px;font-size:12px"></i>
      </button>
    </li>
  `,
  events: {
    'click button[data-hook=action_button]': 'onClick'
  },
  bindings: {
    execution_lifecycle: {
      hook: 'job_lifecycle',
      type: 'attribute',
      name: 'class'
    },
    action_button_icon: {
      hook: 'action_button_icon',
      type: 'attribute',
      name: 'class'
    },
    action_button_title: {
      hook: 'action_button',
      type: 'attribute',
      name: 'title'
    }
  },
  derived: {
    execution_lifecycle: {
      deps: ['model.lifecycle', 'model.state'],
      fn () {
        const lifecycle = this.model.lifecycle
        const state = this.model.state

        const isCompleted = (lifecycle) => {
          return [
            LifecycleConstants.COMPLETED,
            LifecycleConstants.TERMINATED,
            LifecycleConstants.FINISHED
          ].indexOf(lifecycle) !== -1
        }

        if (!lifecycle) return ''
        if (lifecycle === LifecycleConstants.READY) {
          return 'fa fa-spin fa-refresh'
        }
        if (lifecycle === LifecycleConstants.ASSIGNED) {
          return 'fa fa-spin fa-refresh remark-success'
        }
        if (isCompleted(lifecycle)) {
          if (state === StateConstants.CANCELED) {
            return 'fa fa-exclamation remark-alert'
          }
          if (state === StateConstants.FAILURE) {
            return 'fa fa-exclamation remark-alert'
          }
          if (state === StateConstants.ERROR) {
            return 'fa fa-question remark-warning'
          }
          return 'fa fa-check remark-success'
        }
        if (lifecycle === LifecycleConstants.ONHOLD) {
          return 'fa fa-exclamation remark-warning'
        }
        return 'fa fa-question remark-alert'
      }
    },
    action_button_icon: {
      deps: ['model.lifecycle'],
      fn () {
        const lifecycle = this.model.lifecycle
        switch (lifecycle) {
          case LifecycleConstants.FINISHED:
          case LifecycleConstants.TERMINATED:
          case LifecycleConstants.COMPLETED:
          case LifecycleConstants.EXPIRED:
          case LifecycleConstants.CANCELED:
            return 'fa fa-file-text-o'
            break
          case LifecycleConstants.READY:
          case LifecycleConstants.ASSIGNED:
            return 'fa fa-stop remark-alert'
            break
          case LifecycleConstants.ONHOLD:
            return 'fa fa-clock-o remark-warning'
            break
          default:
            return 'fa fa-play'
            break
        }
      }
    },
    action_button_title: {
      deps: ['model.lifecycle'],
      fn () {
        const lifecycle = this.model.lifecycle
        switch (lifecycle) {
          case LifecycleConstants.FINISHED:
          case LifecycleConstants.TERMINATED:
          case LifecycleConstants.COMPLETED:
          case LifecycleConstants.EXPIRED:
          case LifecycleConstants.CANCELED:
            return 'Click to see job execution output'
            break
          case LifecycleConstants.READY:
          case LifecycleConstants.ASSIGNED:
            return 'Task running, click to Cancel execution'
            break
          case LifecycleConstants.ONHOLD:
            return 'Waiting for assignee approval'
            break
          default:
            return 'Job execution'
            break
        }
      }
    },
    show_execution_output: {
      deps: ['model.lifecycle'],
      fn () {
        const lifecycle = this.model.lifecycle
        switch (lifecycle) {
          case LifecycleConstants.FINISHED:
          case LifecycleConstants.TERMINATED:
          case LifecycleConstants.COMPLETED:
          case LifecycleConstants.EXPIRED:
          case LifecycleConstants.CANCELED:
            return true
            break
          default:
            return false
            break
        }
      }
    }
  },
  onClick (event) {
    event.stopPropagation()
    event.preventDefault()

    if (this.show_execution_output) {
      this.showExecutionOutput()
    } else {
      this.execute()
    }

    return false
  },
  showExecutionOutput () {
    const view = new JobResult({ job: this.model })
    view.show()
  },
  execute () {
    var execJob
    if (this.model._type === JobConstants.APPROVAL_TYPE) {
      execJob = new ExecApprovalJob({model: this.model})
    } else {
      execJob = new ExecJob({model: this.model})
    }
    execJob.execute()
  },
  render () {
    View.prototype.render.apply(this, arguments)
  }
})
