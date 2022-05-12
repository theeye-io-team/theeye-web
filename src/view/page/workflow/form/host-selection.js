import App from 'ampersand-app'
import InputView from 'components/input-view'
import Modalizer from 'components/modalizer'
import FormView from 'ampersand-form-view'
import FormButtons from 'view/buttons'
import SelectView from 'components/select2-view'

export default InputView.extend({
  initialize (options) {
    this.label = 'Change Bot'
    this.name = 'host'
    this.required = false
    this.type = 'button'
    this.styles = 'input-width-30 form-group'
    this.onSelection = options.onSelection
    InputView.prototype.initialize.apply(this, arguments)
  },
  render () {
    InputView.prototype.render.apply(this, arguments)
    this.input.addEventListener('click', (e) => {
      const hostSelection = new HostSelectionInput({})
      const dialog = new Modalizer({
        fade: false,
        center: true,
        buttons: false,
        title: 'Bot Selection',
        bodyView: hostSelection 
      })
      dialog.on('hidden', () => {
        hostSelection.remove()
        dialog.remove()
      })
      hostSelection.on('submit', (id) => {
        this.onSelection(id)
        dialog.hide()
      })
      dialog.show()
    }, false)
  }
})

const HostSelectionInput = FormView.extend({
  initialize (options) {
    this.fields = [
      new SelectView({
        label: 'Select the new Bot',
        multiple: false,
        name: 'host',
        tags: false,
        options: App.state.hosts,
        value: null,
        required: true,
        unselectedText: 'change the bot',
        idAttribute: 'id',
        textAttribute: 'hostname',
        requiredMessage: 'Selection required',
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label'
      })
    ]
    FormView.prototype.initialize.apply(this, arguments)
  },
  render () {
    FormView.prototype.render.apply(this, arguments)
    this.query('form').classList.add('form-horizontal')

    const buttons = new FormButtons({ confirmText: 'Confirm' })
    this.renderSubview(buttons)
    buttons.on('click:confirm', this.submit, this)
  },
  submit () {
    this.beforeSubmit()
    if (!this.valid) { return }
    this.trigger('submit', this.data.host)
  }
})
