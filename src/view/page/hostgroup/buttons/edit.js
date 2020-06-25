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
          const msg = [
            'Do you want to also remove the template monitors and tasks from the removed Bots?',
            '<b>NO:</b> Only remove the Bots form the template.',
            '<b>YES:</b> Remove the Bots form the template and also delete the template monitors and tasks from the removed Bots.'
          ].join('<br>')

          bootbox.dialog({
            title: 'Warning! Please, read carefully before you continue.',
            message: msg,
            buttons: {
              no: {
                label: 'NO',
                className: 'btn-default',
                callback: function() {
                  HostGroupActions.update(self.model.id, form.data, false)
                }
              },
              yes: {
                label: 'YES',
                className: 'btn-danger',
                callback: function() {
                  HostGroupActions.update(self.model.id, form.data, true)
                }
              }
            }
          })
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
