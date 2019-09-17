import View from 'ampersand-view'
import LifecycleConstants from 'constants/lifecycle'
import JobConstants from 'constants/job'
import StateConstants from 'constants/states'
import { ExecJob, ExecApprovalJob } from './exec-job.js'
import JobResult from 'view/page/dashboard/job-result'
import './styles.less'

module.exports = View.extend({
  /*
  template: `
    <div data-component="job-exec-button">
      <li class="button-container">
        <button class="btn btn-primary tooltiped" data-hook="execution_button">
          <i data-hook="execution_button_icon" aria-hidden="true" class="fa fa-file-text-o"></i>
        </button>
      </li>
      <li class="button-container">
        <button class="btn btn-primary tooltiped" data-hook="action_button">
          <i data-hook="execution_icon" aria-hidden="true"></i>
          <i data-hook="job_lifecycle" style="top:-6px;position:relative;right:4px;font-size:12px"></i>
        </button>
      </li>
    </div>
  `,
  */
  template: `
    <div data-component="job-exec-button">
      <li class="button-container">
        <button class="btn btn-primary tooltiped" data-hook="execution_button">
          <i aria-hidden="true" class="fa fa-file-text-o"></i>
        </button>
      </li>
      <li class="button-container">
        <button class="btn btn-primary tooltiped" data-hook="action_button">
          <i data-hook="execution_lifecycle_icon" aria-hidden="true"></i>
          <i data-hook="execution_progress_icon" style="top:-6px;position:relative;right:4px;font-size:12px"></i>
        </button>
      </li>
    </div>
  `,
  events: {
    'click button[data-hook=action_button]': 'onClickActionButton',
    'click button[data-hook=execution_button]': 'onClickExecutionButton'
  },
  bindings: {
    execution_progress_icon: {
      hook: 'execution_progress_icon',
      type: 'attribute',
      name: 'class'
    },
    execution_lifecycle_icon: {
      hook: 'execution_lifecycle_icon',
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
    execution_progress_icon: {
      deps: ['model.lifecycle','model.state'],
      fn () {
        const lifecycle = this.model.lifecycle

        if (lifecycle === LifecycleConstants.READY) {
          return 'fa fa-spin fa-refresh'
        }

        if (lifecycle === LifecycleConstants.ASSIGNED) {
          return 'fa fa-spin fa-refresh remark-success'
        }

        //if (lifecycle === LifecycleConstants.ONHOLD) {
        //  return 'fa fa-clock-o remark-warning'
        //  return 'fa fa-exclamation remark-warning'
        //}

        return ''
      }
    },
    execution_lifecycle_icon: {
      deps: ['model.lifecycle'],
      fn () {
        const lifecycle = this.model.lifecycle
        const state = this.model.state

        if (isCompleted(lifecycle)) {
          if (state === StateConstants.CANCELED) { return 'fa fa-exclamation remark-alert' }
          if (state === StateConstants.FAILURE) { return 'fa fa-exclamation remark-alert' }
          if (state === StateConstants.ERROR) { return 'fa fa-question remark-warning' }
          return 'fa fa-check remark-success'
        }
        if (lifecycle === LifecycleConstants.ONHOLD) {
          //return 'fa fa-exclamation remark-warning'
          return 'fa fa-clock-o remark-warning'
        }
        if (
          lifecycle === LifecycleConstants.READY ||
          lifecycle === LifecycleConstants.ASSIGNED
        ) {
          return 'fa fa-stop remark-alert'
        }
        //return 'fa fa-question remark-alert'
        return 'fa fa-play'
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
  onClickActionButton (event) {
    event.stopPropagation()
    event.preventDefault()
    if (!this.show_execution_output) {
      this.execute()
    }
    return false
  },
  onClickExecutionButton (event) {
    event.stopPropagation()
    event.preventDefault()
    this.showExecutionOutput()
    return false
  },
  showExecutionOutput () {
    const view = new JobResult({ job: this.model })
    view.show()
    return view
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

const isCompleted = (lifecycle) => {
  return [
    LifecycleConstants.COMPLETED,
    LifecycleConstants.FINISHED,
    LifecycleConstants.EXPIRED, // take to much time to complete
    LifecycleConstants.TERMINATED // abruptly
  ].indexOf(lifecycle) !== -1
}
