'use strict'

import PanelButton from 'components/list/item/panel-button'
import HostGroupActions from 'actions/hostgroup'
import Modalizer from 'components/modalizer'
import FormView from '../form'
import bootbox from 'bootbox'
import $ from 'jquery'

export default PanelButton.extend({
  initialize (options) {
    this.title = 'Edit template'
    this.iconClass = 'fa fa-edit dropdown-icon'
    this.className = 'btn btn-primary'
  },
  events: {
    click (event) {
      event.stopPropagation()
      $('.dropdown.open .dropdown-toggle').dropdown('toggle')

      const form = new FormView({ model: this.model })
      const modal = new Modalizer({
        confirmButton: 'Save',
        buttons: true,
        title: this.title,
        bodyView: form
      })

      this.listenTo(modal,'shown',() => { form.focus() })

      this.listenTo(modal,'hidden',() => {
        form.remove()
        modal.remove()
      })

      this.listenTo(modal,'confirm',() => {
        var self = this
        form.beforeSubmit()
        if (!form.valid) return

        if(self.hostsDeleted(form.data)) {
          const model = self.model
          const dialog = new Dialog({ model, form })
          dialog.show()
        } else {
          HostGroupActions.update(self.model.id, form.data, false)
        }
        modal.hide()
      })

      modal.show()
    }
  },
  hostsDeleted (data) {
    var deleted = false
    var prevHosts = this.model.hosts.models.map(i => i.id)
    prevHosts.forEach( function(id) {
      deleted = !data.hosts.includes(id)
    })
    return deleted
  }
})

const Dialog = Modalizer.extend({
  props: {
    form: 'view'
  },
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
                  data-dismiss="modal"
                  aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
                <h4 data-hook="title" class="modal-title"></h4>
              </div>
              <div class="modal-body" data-hook="body">
                <p style="padding-top:15px">The Bots will be detached from the Template. What do you want to do with the removed BOTS Linked Components (Task, Monitors, Files...)?</p>
                
                <div class="grid-container">

                  <!-- row 1 -->
                  <div class="grid-col-button">
                    <button type="button" class="btn btn-default" data-hook="keep">
                      <i class="fa fa-arrow-right"></i>
                    </button>
                  </div>
                  <div class="grid-col-message">
                    <b>Make Copies and Unlink:</b> ALL the Components of the Template will be copied the BOTS and will be unlinked. Future changes in the Template Components or in the BOTs Components will not affect each other.
                  </div>

                  <!-- row 2 -->
                  <div class="grid-col-button">
                    <button type="button" class="btn btn-default" data-hook="remove">
                      <i class="fa fa-arrow-right"></i>
                    </button>
                  </div>
                  <div class="grid-col-message">
                    <b>Remove Everything:</b> ALL the Components linked to Template will be removed. Only modified versions of the Components will be keep and of course everything not belonging to the Template
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
    'click [data-hook=keep]': 'onClickKeep',
    'click [data-hook=remove]': 'onClickRemove'
  }),
  onClickKeep (event) {
    event.preventDefault()
    event.stopPropagation()
    HostGroupActions.update(this.model.id, this.form.data, false)
    this.hide()
  },
  onClickRemove (event) {
    event.preventDefault()
    event.stopPropagation()
    HostGroupActions.remove(this.model.id, this.form.data, true)
    this.hide()
  }
})
