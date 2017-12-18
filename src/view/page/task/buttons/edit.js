'use strict'

import PanelButton from 'components/list/item/panel-button'
import Modalizer from 'components/modalizer'

module.exports = PanelButton.extend({
  initialize (options) {
    this.title = 'Edit Task'
    this.tip = 'Edit Task'
    this.iconClass = 'fa fa-edit'
    this.className = 'btn btn-primary'
  },
  events: {
    click (event) {
      event.stopPropagation()

      return import(/* webpackChunkName: "task-form" */ '../form').then(FormView => {
        const form = new FormView({
          model: this.model
        })
        const modal = new Modalizer({
          buttons: false,
          title: this.title,
          bodyView: form
        })

        this.listenTo(modal,'shown',() => { form.focus() })

        this.listenTo(modal,'hidden',() => {
          form.remove()
          modal.remove()
        })

        this.listenTo(form,'submitted',() => {
          modal.hide()
        })

        modal.show()
      })
    }
  }
})
