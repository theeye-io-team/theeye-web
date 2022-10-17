import App from 'ampersand-app'
import Modalizer from 'components/modalizer'
import FileForm from './form'

export default Modalizer.extend({
  props: {
    file: 'object'
  },
  initialize () {
    Modalizer.prototype.initialize.apply(this,arguments)

    this.buttons = false
    this.title = 'Import File'

    const fileModel = new App.Models.File.Model(this.file, { parse: true })

    this.form = new FileForm({
      model: fileModel,
      onsubmit: (data) => {
        this.file = data
        this.trigger('submitted', data)
        this.hide()
      }
    })

    this.bodyView = this.form
  },
  render () {
    Modalizer.prototype.render.apply(this,arguments)

    this.on('shown', () => { this.form.focus() })
    this.on('hidden', () => {
      this.form.remove()
      this.remove()
    })
  }
})
