import FormView from 'ampersand-form-view'
import InputView from 'components/input-view'

import App from 'ampersand-app'

export default FormView.extend({
  initialize (options) {
    const isNew = this.model.isNew()

    this.fields = [
      new InputView({
        name: 'display_name',
        label: 'Display Name',
        value: this.model.display_name,
        required: false,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        autofocus: true
      }),
      new InputView({
        name: 'description',
        label: 'Description',
        value: this.model.description,
        required: false,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label'
      })
    ]

    FormView.prototype.initialize.apply(this, arguments)
  },
  render () {
    FormView.prototype.render.apply(this, arguments)
    this.query('form').classList.add('form-horizontal')
  }
})
