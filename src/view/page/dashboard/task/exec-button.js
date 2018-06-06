//import ladda from 'ladda'
import View from 'ampersand-view'
import './styles.less'
import LifecycleConstants from 'constants/lifecycle'

module.exports = View.extend({
  template: `
    <li class="task-exec-button">
      <button
        class="ladda-button btn btn-primary tooltiped"
        data-hook="action_button"
        data-spinner-size="30"
        data-style="zoom-in">
        <i data-hook="action_button_icon" aria-hidden="true"></i>
        <i data-hook="last_job_lifecycle" style="top:-6px;position:relative;right:4px;font-size:12px"></i>
      </button>
    </li>
  `,
  events: {
    'click button[data-hook=action_button]':'onClickExecute',
  },
  render () {
    this.renderWithTemplate()
    //this.lbutton = ladda.create( this.queryByHook('execute') )
  },
  bindings: {
    execution_lifecycle: {
      hook: 'last_job_lifecycle',
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
      deps: ['model.lastjob.lifecycle'],
      fn () {
        const job = this.model.lastjob
        if (!job) return

        const lifecycle = job.lifecycle
        const state = job.state

        const isCompleted = (lifecycle) => {
          return [
            LifecycleConstants.COMPLETED,
            LifecycleConstants.TERMINATED,
            LifecycleConstants.FINISHED,
          ].indexOf(lifecycle) !== -1
        }

        if (!lifecycle) return ''
        if (lifecycle === LifecycleConstants.READY) return 'fa fa-spin fa-refresh'
        if (lifecycle === LifecycleConstants.ASSIGNED) return 'fa fa-spin fa-refresh remark-success'
        if (isCompleted(lifecycle)) {
          if (state === 'failure') return 'fa fa-exclamation remark-alert'
          return 'fa fa-check remark-success'
        }
        if (lifecycle === LifecycleConstants.CANCELED) {
          return 'fa fa-ban remark-alert'
        }
        if (lifecycle === LifecycleConstants.ASSIGNED) {
          return 'fa fa-ban remark-alert'
        }
        if (lifecycle === LifecycleConstants.ONHOLD) {
          return 'fa fa-exclamation remark-warning'
        }
        return 'fa fa-question remark-alert'
      }
    },
    action_button_icon: {
      deps: ['model.lastjob.lifecycle'],
      fn () {
        if (!this.model.lastjob) return 'fa fa-play'

        const lifecycle = this.model.lastjob.lifecycle
        switch (lifecycle) {
          case LifecycleConstants.FINISHED:
          case LifecycleConstants.TERMINATED:
          case LifecycleConstants.COMPLETED:
          case LifecycleConstants.EXPIRED:
          case LifecycleConstants.CANCELED:
            return 'fa fa-play'
            break;
          case LifecycleConstants.READY:
          case LifecycleConstants.ASSIGNED:
            return 'fa fa-stop remark-alert'
            break;
          case LifecycleConstants.ONHOLD:
            return 'fa fa-clock-o remark-warning'
            break;
          default:
            return 'fa fa-play'
            break;
        }
      }
    },
    action_button_title: {
      deps: ['model.lastjob.lifecycle'],
      fn () {
        if (!this.model.lastjob) return 'Click to run'
        const lifecycle = this.model.lastjob.lifecycle
        switch (lifecycle) {
          case LifecycleConstants.FINISHED:
          case LifecycleConstants.TERMINATED:
          case LifecycleConstants.COMPLETED:
          case LifecycleConstants.EXPIRED:
          case LifecycleConstants.CANCELED:
            return 'Click to execute this Task'
            break;
          case LifecycleConstants.READY:
          case LifecycleConstants.ASSIGNED:
            return 'Task running, click to Cancel execution'
            break;
          case LifecycleConstants.ONHOLD:
            return 'Waiting for assignee approval'
            break;
          default:
            return 'Click to run for the first Time!'
            break;
        }
      }
    }
  }
})
