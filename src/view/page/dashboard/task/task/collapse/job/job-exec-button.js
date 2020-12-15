import App from 'ampersand-app'
import View from 'ampersand-view'
import bootbox from 'bootbox'
import * as LifecycleConstants from 'constants/lifecycle'
import JobResult from 'view/page/dashboard/job-result'
import { ExecOnHoldJob } from './exec-job'
import OptionsDialog from './options-dialog'
import './styles.less'

export default View.extend({
  template: `
    <div data-component="job-exec-button">
      <li class="button-container">
        <button class="btn btn-primary tooltiped" data-hook="execution_button">
          <i aria-hidden="true" class="fa fa-file-text-o"></i>
        </button>
      </li>
      <li class="button-container">
        <button class="btn btn-primary tooltiped" data-hook="action_button">
          <i data-hook="lifecycle_icon" aria-hidden="true"></i>
          <i data-hook="progress_icon" style="top:-6px;position:relative;right:4px;font-size:12px"></i>
        </button>
      </li>
      <li class="button-container panel-item icons dropdown">
        <button class="btn dropdown-toggle btn-primary" data-hook="job-options-button">
          <i class="fa fa-cogs" aria-hidden="true"></i>
        </button>
      </li>
    </div>
  `,
  events: {
    'click button[data-hook=action_button]': 'onClickActionButton',
    'click button[data-hook=execution_button]': 'onClickExecutionButton',
    'click button[data-hook=job-options-button]': 'onClickJobOptionsButton',
  },
  bindings: {
    'model.progress_icon': {
      hook: 'progress_icon',
      type: 'attribute',
      name: 'class'
    },
    'model.lifecycle_icon': {
      hook: 'lifecycle_icon',
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
            return 'Job execution completed'
            break
          case LifecycleConstants.READY:
          case LifecycleConstants.ASSIGNED:
            return 'Task running, click to Cancel execution'
            break
          case LifecycleConstants.ONHOLD:
            return 'Waiting for action'
            break
          default:
            return 'Job execution'
            break
        }
      }
    },
  },
  onClickActionButton (event) {
    event.stopPropagation()
    event.preventDefault()

    let lifecycleAction
    if (this.model.lifecycle === LifecycleConstants.ONHOLD) {
      lifecycleAction = new ExecOnHoldJob({ model: this.model })
    } else if (LifecycleConstants.inProgress(this.model.lifecycle)) {
      lifecycleAction = new StopInProgressJob({ model: this.model })
    } else {
      return
    }

    lifecycleAction.execute()
    return false
  },
  onClickExecutionButton (event) {
    event.stopPropagation()
    event.preventDefault()

    const view = new JobResult({ job: this.model })
    view.show()

    App.actions.job.fillUser(this.model)

    return false
  },
  onClickJobOptionsButton (event) {
    event.stopPropagation()
    event.preventDefault()

    const dialog = new OptionsDialog({ model: this.model })
    dialog.show()
    this.registerSubview( dialog )

    return false
  }
})

class StopInProgressJob {
  constructor (options) {
    this.model = options.model
  }

  execute () {
    if (!this.model.inProgress) {
      return
    }

    const message = `Cancel the execution of <b>${this.model.name}</b>?
      <a target="_blank" href="https://github.com/theeye-io/theeye-docs/blob/master/tasks/cancellation">Why this happens?</a>`

    bootbox.confirm({
      message: message,
      backdrop: true,
      callback: (confirmed) => {
        if (confirmed) {
          App.actions.job.cancel(this.model)
        }
      }
    })
  }
}
