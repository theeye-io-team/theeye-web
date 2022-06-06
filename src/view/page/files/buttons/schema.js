import App from 'ampersand-app'
import Modalizer from 'components/modalizer'
import CommonButton from 'components/common-button'
import FormView from 'ampersand-form-view'
import FormButtons from 'view/buttons'
import TextareaView from 'components/input-view/textarea'

export default CommonButton.extend({
  initialize (options) {
    this.title = 'Content Schema'
    this.iconClass = 'fa fa-edit'
    this.className = 'btn btn-primary'
  },
  events: {
    click (event) {
      event.preventDefault()
      event.stopPropagation()

      const schema = new SchemaForm({ model: this.model })

      const modal = new Modalizer({
        fade: false,
        center: true,
        buttons: false,
        title: 'Content Schema Definition',
        bodyView: schema 
      })

      modal.on('hidden',() => {
        schema.remove()
        modal.remove()
      })

      schema.on('submit', (schema) => {
        App.actions.file.updateContentSchema(this.model.id, schema)
        modal.hide() // hide and auto-remove
      })

      modal.show()
      return false

    }
  }
})

const SchemaForm = FormView.extend({
  initialize (options) {
    const schema = new TextareaView({
      label: 'Content Schema',
      name: 'content_schema',
      required: false,
      invalidClass: 'text-danger',
      validityClassSelector: '.control-label',
      value: JSON.stringify(this.model.content_schema),
      tests: [
        (value) => {
          try {
            JSON.parse(value)
          } catch (e) {
            return e.message
          }
        }
      ]
    })

    this.fields = [ schema ]

    FormView.prototype.initialize.apply(this, arguments)
  },
  render () {
    FormView.prototype.render.apply(this, arguments)
    this.query('form').classList.add('form-horizontal')

    const buttons = new FormButtons({ confirmText: 'Add' })
    this.renderSubview(buttons)
    buttons.on('click:confirm', this.submit, this)
  },
  submit () {
    this.beforeSubmit()
    if (!this.valid) { return }
    let schema = this.prepareData()
    this.trigger('submit', schema)
  },
  prepareData () {
    return JSON.parse(this._fieldViews.content_schema.value)
  }
})

