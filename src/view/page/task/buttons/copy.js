import App from 'ampersand-app'
import PanelButton from 'components/list/item/panel-button'
import Modalizer from 'components/modalizer'
import bootbox from 'bootbox'
import { Factory as TaskFactory } from 'models/task'
import $ from 'jquery'

export default PanelButton.extend({
  initialize (options) {
    this.title = 'Copy'
    this.iconClass = 'fa fa-copy dropdown-icon'
    this.className = 'btn btn-primary'
  },
  events: {
    click (event) {
      event.stopPropagation()
      $('.dropdown.open .dropdown-toggle').dropdown('toggle')
      return copyTask(this.model)
    }
  }
})

const copyTask = (task) => {
  return import(/* webpackChunkName: "task-form" */ '../form')
    .then(({ default: FormView }) => {
      const model = new TaskFactory({ type: task.type }, { store: false })
      const form = new FormView({ model })
      const modal = new Modalizer({
        buttons: false,
        title: `Coping Task ${task.name}`,
        bodyView: form
      })

      modal.on('shown',() => {
        form.focus()
        form.setWithTask(task)
        form._fieldViews.triggers.setValue([])
      })

      modal.on('hidden',() => {
        form.remove()
        modal.remove()
      })

      form.on('submit', (data) => {
        App.actions.task.create(data)
        modal.hide()
      })

      modal.show()
    })
}
