import App from 'ampersand-app'
import Modalizer from 'components/modalizer'
import Help from 'language/help'
import { RepeatCompletedJob, RestartCompletedJob } from '../exec-job'
import './styles.less'
import ChangeAssignee from '../change-assignee'

export default Modalizer.extend({
  initialize () {
    this.title = 'Job Options'
    //this.buttons = false // disable build-in modal buttons
    Modalizer.prototype.initialize.apply(this, arguments)

    this.on('hidden', () => { this.remove() })
  },
  template: `
    <div data-component="job-options-dialog" class="modalizer">
      <!-- MODALIZER CONTAINER -->
      <div data-hook="modalizer-class" class="">
        <div class="modal"
          tabindex="-1"
          role="dialog"
          aria-labelledby="modal"
          aria-hidden="true"
          style="display:none;">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <button type="button"
                  class="close"
                  data-dismiss="modal"
                  aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
                <h4 data-hook="title" class="modal-title"></h4>
              </div>
              <div class="modal-body" data-hook="body">
                <h1>Task export options</h1>

                <div class="grid-container">
                  <!-- row 1 -->
                  <div class="grid-col-button" data-hook="restart-container">
                    <button type="button" class="btn btn-default" data-hook="restart-button">
                      <i class="fa fa-arrow-right"></i>
                    </button>
                  </div>
                  <div class="grid-col-message" data-hook="restart-label">
                    <span>${Help.job.restart}<i data-hook="restart-label-progress"> (in progress...)</i></span>
                  </div>

                  <!-- row 2 -->
                  <div class="grid-col-button" data-hook="repeat-container">
                    <button type="button" class="btn btn-default" data-hook="repeat-button">
                      <i class="fa fa-arrow-right"></i>
                    </button>
                  </div>
                  <div class="grid-col-message" data-hook="repeat-label">
                    <span>${Help.job.repeat}</span>
                  </div>

                  <!-- row 3 -->
                  <div class="grid-col-button" data-hook="change-assignee-toggle">
                    <button type="button" class="btn btn-default" data-hook="change-assignee">
                      <i class="fa fa-arrow-right"></i>
                    </button>
                  </div>
                  <div class="grid-col-message" data-hook="change-assignee-toggle">
                    <span>${Help.job.change_assignee}</span>
                  </div>

                  <!-- row 4 -->
                  <div class="grid-col-button">
                    <button type="button" class="btn btn-default" data-hook="close">
                      <i class="fa fa-arrow-left"></i>
                    </button>
                  </div>
                  <div class="grid-col-message">
                    <span><b>Go Back</b></span>
                  </div>
                </div>
              </div>
            </div><!-- /MODAL-CONTENT -->
          </div><!-- /MODAL-DIALOG -->
        </div><!-- /MODAL -->
      </div><!-- /MODALIZER CONTAINER -->
    </div>
  `,
  events: {
    'click [data-hook=close]':function (event) {
      event.preventDefault()
      event.stopPropagation()
      this.hide()
    },
    'click button[data-hook=repeat-button]': function (event) {
      event.preventDefault()
      event.stopPropagation()

      const action = new RepeatCompletedJob({ model: this.model })
      action.execute()
      this.hide()
    },
    'click button[data-hook=restart-button]': function (event) {
      event.preventDefault()
      event.stopPropagation()

      if (this.model.inProgress) {
      this.hide()
        return
      }

      const action = new RestartCompletedJob({ model: this.model })
      action.execute()
      this.hide()
    },
    'click button[data-hook=change-assignee]': function (event) {
      event.preventDefault()
      event.stopPropagation()
      this.hide()
      const action = new ChangeAssignee({model: this.model})
      action.show()
    }
  },
  derived: {
    cannotRestart: {
      deps: ['model.workflow_id', 'model.inProgress'],
      fn () {
        const cannot = (
          this.model.inProgress ||
          ( Boolean(this.model.workflow_job_id) && this.model.workflow_job.inProgress )
        )
        return cannot
      }
    },
    // single tasks within workflows cannot be repeated along.
    // only completed workflows can be repeated from the begining.
    canRepeat: {
      deps: ['model.workflow_id'],
      fn () {
        return ! Boolean(this.model.workflow_id)
      }
    },
  },
  bindings: Object.assign({}, Modalizer.prototype.bindings, {
    cannotRestart: [{
      type: 'booleanAttribute',
      hook: 'restart-button',
      name: 'disabled'
    },{
      type: 'toggle',
      hook: 'restart-label-progress'
    },{
      type: 'booleanClass',
      hook: 'restart-label',
      yes: 'restart-label-disabled'
    }],
    canRepeat: [{
      type: 'toggle',
      hook: 'repeat-container'
    },{
      type: 'toggle',
      hook: 'repeat-label'
    }],
    'model.lifecycle': {
      hook: 'change-assignee-toggle',
      type: function (el, value) {
        if (process.env.NODE_ENV === 'production') {
          el.style.display = 'none'
        } else {
          el.style.display = (value === 'onhold') ? 'block': 'none'
        }
      }
    }
  })
})
