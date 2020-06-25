import Modalizer from 'components/modalizer'
import TaskForm from './form'

export default Modalizer.extend({
  initialize () {
    Modalizer.prototype.initialize.apply(this, arguments)

    this.buttons = false
    this.title = 'Edit Task'

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
    this.listenTo(this.form, 'submitted', () => {
      this.hide()
    })
  }
})
