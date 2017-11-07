'use strict'

import PanelButton from 'components/list/item/panel-button'
import Modalizer from 'components/modalizer'

module.exports = PanelButton.extend({
  initialize (options) {
    this.title = 'Copy Task'
    this.iconClass = 'fa fa-clone'
    this.className = 'btn btn-primary'
  },
  events: {
    click (event) {
      event.stopPropagation()

      const form = new CopyForm()
      const modal = new Modalizer({
        confirmButton: 'Copy',
        buttons: true,
        title: this.title,
        bodyView: form
      })

      this.listenTo(modal,'shown',() => { form.focus() })
      this.listenTo(modal,'hidden',() => {
        form.remove()
        modal.remove()
      })
      this.listenTo(form,'submitted',() => {
        if (valid===true) modal.hide()
      })

      modal.show()
    }
  }
})
