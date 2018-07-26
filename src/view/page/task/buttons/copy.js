'use strict'

import PanelButton from 'components/list/item/panel-button'
import Modalizer from 'components/modalizer'
import bootbox from 'bootbox'
import { Factory as TaskFactory } from 'models/task'

module.exports = PanelButton.extend({
  initialize (options) {
    this.title = 'Copy Task'
    this.tip = 'Copy Task'
    this.iconClass = 'fa fa-copy'
    this.className = 'btn btn-primary'
  },
  events: {
    click (event) {
      event.stopPropagation()

      return import(/* webpackChunkName: "task-form" */ '../form').then(FormView => {

        const task = new TaskFactory({type: this.model.type})

        const form = new FormView({
          model: task
        })

        const modal = new Modalizer({
          buttons: false,
          title: this.title,
          bodyView: form
        })

        this.listenTo(modal,'shown',() => {
          form.focus()
          form.setWithTask(this.model)
          form._fieldViews.name.input.value = ''
        })

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
