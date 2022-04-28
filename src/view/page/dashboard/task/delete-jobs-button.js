import App from 'ampersand-app'
import View from 'ampersand-view'
import CommonButton from 'components/common-button'
import JobActions from 'actions/job'
import Modalizer from 'components/modalizer'

export default CommonButton.extend({
  initialize (options) {
    this.iconClass = 'fa fa-trash dropdown-icon'
    this.className = 'btn btn-primary'
  },
  events: {
    click: function (event) {
      event.stopPropagation()
      $('.dropdown.open .dropdown-toggle').dropdown('toggle')

      const modal = new DeleteMessageModalizer()

      modal.on('delete-finished', () => {
        this.trigger('clicked')
        App.actions.job.cleanQueue(this.model)
        modal.hide()
      })

      modal.on('delete-all', () => {
        this.trigger('clicked')
        App.actions.job.cleanQueue(this.model, { lifecycle: ['ready'] })
        modal.hide()
      })

      this.listenTo(modal, 'hidden', () => { modal.remove() })
      modal.show()
    }
  }
})

const DeleteMessageModalizer = Modalizer.extend({
  initialize () {
    this.title = 'Jobs queue'
    this.buttons = false // disable build-in modals buttons
    Modalizer.prototype.initialize.apply(this, arguments)
  },
  template: `
    <div data-component="modalizer" class="modalizer">
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
                  data-hook="close"
                  aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
                <h4 data-hook="title" class="modal-title"></h4>
              </div>
              <div class="modal-body" data-hook="body">
                <span>Delete finished jobs from execution queue?
                  <div style="bottom:0; position:absolute;"> </div>
                </span>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-primary" data-hook="finished">Delete Finished Jobs</button>
                <button type="button" class="btn btn-danger" data-hook="all">Delete Everything</button>
                <button type="button" class="btn btn-default" data-hook="cancel">Cancel</button>
              </div>
            </div><!-- /MODAL-CONTENT -->
          </div><!-- /MODAL-DIALOG -->
        </div><!-- /MODAL -->
      </div><!-- /MODALIZER CONTAINER -->
    </div>
  `,
  events: Object.assign({}, Modalizer.prototype.events, {
    'click [data-hook=finished]':'clickFinishedButton',
    'click [data-hook=all]':'clickAllButton'
  }),
  clickAllButton (event) {
    this.trigger('delete-all', event)
  },
  clickFinishedButton (event) {
    this.trigger('delete-finished', event)
  }
})
