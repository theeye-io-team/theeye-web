import App from 'ampersand-app'
import PanelButton from 'components/list/item/panel-button'
import Modalizer from 'components/modalizer'
import bootbox from 'bootbox'
import { Factory as TaskFactory } from 'models/task'
import $ from 'jquery'

export default PanelButton.extend({
  initialize (options) {
    this.title = 'Copy task'
    this.iconClass = 'fa fa-copy dropdown-icon'
    this.className = 'btn btn-primary'
  },
  events: {
    click (event) {
      event.stopPropagation()
      $('.dropdown.open .dropdown-toggle').dropdown('toggle')

      return import(/* webpackChunkName: "task-form" */ '../form')
        .then(({ default: FormView }) => {
          const task = new TaskFactory({ type: this.model.type })
          const form = new FormView({ model: task })
          const modal = new Modalizer({
            buttons: false,
            title: this.title,
            bodyView: form
          })

          this.listenTo(modal,'shown',() => {
            form.focus()
            form.setWithTask(this.model)
            form._fieldViews.name.input.value += ' (copy)'
            form._fieldViews.triggers.setValue([])
          })

          this.listenTo(modal,'hidden',() => {
            form.remove()
            modal.remove()
          })

          this.listenTo(form,'submit', data => {
            App.actions.task.create(data)
            modal.hide()
          })

          modal.show()
        })
    }
  }
})
