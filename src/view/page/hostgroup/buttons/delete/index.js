import App from 'ampersand-app'
import PanelButton from 'components/list/item/panel-button'
import HostGroupActions from 'actions/hostgroup'
import bootbox from 'bootbox'
import $ from 'jquery'
import Modalizer from 'components/modalizer'
import './styles.less'

export default PanelButton.extend({
  initialize: function (options) {
    this.title = 'Delete template'
    this.iconClass = 'fa fa-trash dropdown-icon'
    this.className = 'btn btn-primary'
  },
  events: {
    click: function (event) {
      event.stopPropagation()
      event.preventDefault()
      $('.dropdown.open .dropdown-toggle').dropdown('toggle')

      const dialog = new Dialog({ model: this.model })
      dialog.show()
    }
  }
})

const Dialog = Modalizer.extend({
  initialize (options) {

    const hostnames = this.model.hosts.models.map(i => {
      if (!i.hostname) {
        const host = App.state.hosts.get(i.id)
        return host.hostname
      } else {
        return i.hostname
      }
    })

    this.hostnames = hostnames
    this.title = 'Remove Template Confirmation'
    this.buttons = false // disable build-in modal buttons
    Modalizer.prototype.initialize.apply(this, arguments)

    this.on('hidden', () => { this.remove() })
  },
  template () {
    return (`
    <div data-component="delete-template-dialog" class="modalizer">
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
                <p style="padding-top:15px">The following destination HOSTS will be affected too</p>
                ${this.hostnames}
                <p>What do you want to do?</p>

                <div class="grid-container">
                  <!-- row 2 -->
                  <div class="grid-col-button">
                    <button type="button" class="btn btn-default" data-hook="recipe">
                      <i class="fa fa-arrow-right"></i>
                    </button>
                  </div>
                  <div class="grid-col-message">
                    <span><b>Download a copy of the template (recommended).</b></span>
                    If this template is important to you keep a copy of the template and then decide.
                    Note: We will also keep a copy, just in case you need it.
                  </div>

                  <!-- row 1 -->
                  <div class="grid-col-button">
                    <button type="button" class="btn btn-default" data-hook="delete-template">
                      <i class="fa fa-arrow-right"></i>
                    </button>
                  </div>
                  <div class="grid-col-message">
                    <span><b>Delete the template only</b>.
                    Detination Hosts will be keep untouch.
                    You can recover the template from the recipe later.</span>
                  </div>

                  <!-- row 2 -->
                  <div class="grid-col-button">
                    <button type="button" class="btn btn-default" data-hook="delete-everything">
                      <i class="fa fa-arrow-right"></i>
                    </button>
                  </div>
                  <div class="grid-col-message">
                    <span><b>Delete Everything.</b></span>
                    The template will be deleted and the monitors, tasks and files attached to the destination hosts too.
                    You can rollback this later using the backup.
                  </div>

                  <!-- row 3 -->
                  <div class="grid-col-button">
                    <button type="button" class="btn btn-default" data-hook="cancel">
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
  `)
  },
  events: Object.assign({}, Modalizer.prototype.events, {
    'click [data-hook=recipe]': 'clickDownloadRecipe',
    'click [data-hook=delete-everything]': 'clickDeleteEverything',
    'click [data-hook=delete-template]': 'clickDeleteTemplate',
    'click [data-hook=cancel]': 'clickCancelButton'
  }),
  clickDownloadRecipe (event) {
    event.preventDefault()
    event.stopPropagation()
    HostGroupActions.exportToJSON(this.model.id)
    return false
  },
  clickDeleteEverything (event) {
    event.preventDefault()
    event.stopPropagation()
    HostGroupActions.remove(this.model.id, true)
    this.hide()
  },
  clickDeleteTemplate (event) {
    event.preventDefault()
    event.stopPropagation()
    HostGroupActions.remove(this.model.id, false)
    this.hide()
  },
  clickCancelButton (event) {
    event.preventDefault()
    event.stopPropagation()
    this.hide()
  }
})
