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
            'The Bots will be detached from the Template. What do you want to do with the removed BOTS Linked Components (Task, Monitors, Files...)?<br/>',
            '<b>Make Copies and Unlink:</b> ALL the Components of the Template will be copied the BOTS and will be unlinked. Future changes in the Template Components or in the BOTs Components will not affect each other.<br/>',
            '<b>Remove Everything:</b> ALL the Components linked to Template will be removed. Only modified versions of the Components will be keep and of course everything not belonging to the Template'
          ].join('<br>')

          bootbox.dialog({
            title: 'Warning! Please, read carefully before you continue.',
            message: msg,
            buttons: {
              no: {
                label: 'Make Copies',
                className: 'btn-default',
                callback: function() {
                  HostGroupActions.update(self.model.id, form.data, false)
                }
              },
              yes: {
                label: 'Remove Everything',
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
