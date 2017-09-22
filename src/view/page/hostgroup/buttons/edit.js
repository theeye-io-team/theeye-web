'use strict'

import PanelButton from 'components/list/item/panel-button'
import HostGroupActions from 'actions/hostgroup'
import Modalizer from 'components/modalizer'
import FormView from '../form'

module.exports = PanelButton.extend({
  initialize (options) {
    this.title = 'Edit Host Template'
    this.iconClass = 'fa fa-edit'
    this.className = 'btn btn-primary simple-btn tooltiped'
  },
  events: {
    click (event) {
      event.stopPropagation()

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
        form.beforeSubmit()
        if (!form.valid) return
        HostGroupActions.update(this.model.id, form.data)
        modal.hide()
      })

      modal.show()
    }
  }
})
