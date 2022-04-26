import App from 'ampersand-app'
import PanelButton from 'components/list/item/panel-button'
import Modalizer from 'components/modalizer'
import WorkflowFormView from '../form'
import $ from 'jquery'
import { copyWorkflow } from './copy'
import Help from 'language/help'
import './edit.less'

export default PanelButton.extend({
  initialize (options) {
    this.title = 'Edit workflow'
    this.iconClass = 'fa fa-edit dropdown-icon'
    this.className = 'btn btn-primary'
  },
  events: {
    click (event) {
      event.stopPropagation()
      $('.dropdown.open .dropdown-toggle').dropdown('toggle')

      const version = this.model.version
      if (!version || version !== 2) {
        const dialog = new ActionDialog({ model: this.model })
        dialog.show()
      } else {
        editWorkflow(this.model)
      }
    }
  }
})

const ActionDialog = Modalizer.extend({
  initialize () {
    this.title = 'Workflow migration required'
    this.removeOnHide = true
    this.fade = false
    this.buttons = false // disable build-in modal buttons

    Modalizer.prototype.initialize.apply(this, arguments)

    this.on('hidden', () => { this.remove() })
  },
  template: `
    <div data-component="edit-workflow-dialog" class="modalizer">
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
                <p>
                The Workflow will be migrated to Version 2.<br/>
                You can edit your old workflows directly and the structure will be inmediatelly migrated.<br/>
                Now you can choose to make a copy of the workflow and test it.<br/>
                All the tasks and settings will be the exact same.
                </p>

                <div class="grid-container">
                  <!-- row 1 -->
                  <div class="grid-col-button">
                    <button type="button" class="btn btn-default" data-hook="edit">
                      <i class="fa fa-arrow-right"></i>
                    </button>
                  </div>
                  <div class="grid-col-message">
                    <span>Edit</span>
                  </div>

                  <!-- row 2 -->
                  <div class="grid-col-button">
                    <button type="button" class="btn btn-default" data-hook="copy">
                      <i class="fa fa-arrow-right"></i>
                    </button>
                  </div>
                  <div class="grid-col-message">
                    <span>Copy <b style="alert-success">(Recomended)</b></span>
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
  events: Object.assign({}, Modalizer.prototype.events, {
    'click [data-hook=edit]': 'clickEdit',
    'click [data-hook=copy]': 'clickCopy'
  }),
  clickEdit (event) {
    event.preventDefault()
    event.stopPropagation()
    editWorkflow(this.model)
    this.hide()
  },
  clickCopy (event) {
    event.preventDefault()
    event.stopPropagation()
    copyWorkflow(this.model)
    this.hide()
  }
})

export const editWorkflow = (model) => {
  $('.dropdown.open .dropdown-toggle').dropdown('toggle')

  App.actions.workflow.populate(model)
  const form = new WorkflowFormView({ model, builder_mode: 'edit' })

  const modal = new Modalizer({
    buttons: false,
    title: `Editing Workflow ${model.name}`,
    bodyView: form
  })

  //modal.on('shown',() => { form.focus() })

  modal.on('hidden',() => {
    form.remove()
    modal.remove()
  })

  form.on('submit', data => {
    App.actions.workflow.update(model.id, data)
    modal.hide()
  })

  modal.show()
}
