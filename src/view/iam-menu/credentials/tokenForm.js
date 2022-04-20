import FormView from 'ampersand-form-view'
import InputView from 'components/input-view'

export default FormView.extend({
  initialize: function (options) {
    this.fields = [
      new InputView({
        label: 'Token name *',
        name: 'name',
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: this.model.name
      }),
    ]
    FormView.prototype.initialize.apply(this, arguments)
  },
  render () {
    FormView.prototype.render.apply(this, arguments)
    this.query('form').classList.add('form-horizontal')
  },
  focus () {
    this.query('input[name=name]').focus()
  }
})
