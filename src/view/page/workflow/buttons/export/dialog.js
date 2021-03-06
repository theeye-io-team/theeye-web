import Modalizer from 'components/modalizer'
import App from 'ampersand-app'
import Help from 'language/help'
import './styles.less'

export default Modalizer.extend({
  initialize () {
    this.title = 'Workflow Export'
    this.fade = false
    this.center = true
    this.buttons = false // disable build-in modal buttons
    this.removeOnHide = true
    Modalizer.prototype.initialize.apply(this, arguments)
    //this.on('hidden', () => { this.remove() })
  },
  template: `
    <div data-component="export-dialog" class="modalizer">
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
                <div class="grid-container">
                  <!-- row 1 -->
                  <div class="grid-col-button">
                    <button type="button" class="btn btn-default" data-hook="deep">
                      <i class="fa fa-arrow-right"></i>
                    </button>
                  </div>
                  <div class="grid-col-message">
                    <span>${Help.workflow.export_deep}</span>
                  </div>

                  <!-- row 2 -->
                  <div class="grid-col-button">
                    <button type="button" class="btn btn-default" data-hook="shallow">
                      <i class="fa fa-arrow-right"></i>
                    </button>
                  </div>
                  <div class="grid-col-message">
                    <span>${Help.workflow.export_shallow}</span>
                  </div>

                  <!-- row 3 -->
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
  events: Object.assign({}, Modalizer.prototype.events, {
    'click [data-hook=deep]': 'clickDeepExportButton',
    'click [data-hook=shallow]': 'clickShallowExportButton',
  }),
  clickDeepExportButton (event) {
    event.preventDefault()
    event.stopPropagation()
    App.actions.workflow.exportSerialization(this.model.id, 'deep')
    this.hide()
  },
  clickShallowExportButton (event) {
    event.preventDefault()
    event.stopPropagation()
    App.actions.workflow.exportSerialization(this.model.id, 'shallow')
    this.hide()
  }
})
