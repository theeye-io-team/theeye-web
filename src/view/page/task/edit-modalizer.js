import App from 'ampersand-app'
import Modalizer from 'components/modalizer'
import TaskForm from './form'
import bootbox from 'bootbox'

export default Modalizer.extend({
  initialize () {
    Modalizer.prototype.initialize.apply(this, arguments)

    this.buttons = false
    const { name, id } = this.model
    this.title = `Edit task ${name} [${id}]`

    this.form = new TaskForm({ model: this.model })
    this.bodyView = this.form
  },
  render () {
    Modalizer.prototype.render.apply(this,arguments)

    this.on('shown', () => { this.form.focus() })
    this.on('hidden', () => {
      this.form.remove()
      this.remove()
    })
    this.listenTo(this.form, 'submit', data => {
      App.actions.task.update(this.model.id, data)
      this.hide()
    })

    if (this.model.hasTemplate) {
      bootbox.alert({
        title: 'Warning',
        message: `
          <div>
            <p>Warning!</p>
            <p>You are modifying a task that belongs to a template. The changes will be only applied to this task.</p>
          </div>
        `
      })
    }
  }
})
