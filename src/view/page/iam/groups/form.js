import App from 'ampersand-app'
import FormView from 'ampersand-form-view'
import InputView from 'components/input-view'
import CredentialsSelector from 'view/credentials-selector'
//import PolicySelector from '../policy-selector'

export default FormView.extend({
  initialize () {
    const isNewTask = Boolean(this.model.isNew()) // or is import

    this.fields = [
      new InputView({
        name: 'name',
        label: 'Group name',
        value: this.model.name,
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
      }),
      new CredentialsSelector({
        required: true,
        name: 'credential',
        value: this.model.credential
      })
    ]
    FormView.prototype.initialize.apply(this, arguments)
  },
  render () {
    FormView.prototype.render.apply(this, arguments)
    this.query('form').classList.add('form-horizontal')
  },
  prepareData() {
    let data = Object.assign({}, this.data)
    data.customer = App.state.session.customer.id
    return data
  },
  submit () {
    this.beforeSubmit()
    if (this.valid) {
      let data = this.data
      this.trigger('submit', data)
    }
  },
})
