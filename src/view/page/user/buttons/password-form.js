import App from 'ampersand-app'
import FormView from 'ampersand-form-view'
import InputView from 'components/input-view'

export default FormView.extend({
  initialize (options) {
    const passwordInput = new InputView({
      name: 'password',
      type: 'password',
      label: 'Password',
      value: '',
      required: true,
      invalidClass: 'text-danger',
      validityClassSelector: '.control-label',
      tests: [
        (value) => {
          if (value.length < 8) {
            return "Must have at least 8 characters";
          }
        }
      ]
    })
    const passwordConfirm = new InputView({
      name: 'confirmPassword',
      type: 'password',
      label: 'Password Confirmation',
      value: '',
      required: true,
      invalidClass: 'text-danger',
      validityClassSelector: '.control-label',
      tests: [
        (value) => {
          const passval = passwordInput.value
          if (value != passval) {
            return 'Passwords doesn\'t match'
          }
        },
        (value) => {
          if (value.length < 8) {
            return "Must have at least 8 characters";
          }
        }
      ]
    })
    this.fields = [ passwordInput, passwordConfirm ]
    FormView.prototype.initialize.apply(this, arguments)
  },
  render () {
    FormView.prototype.render.apply(this, arguments)
    this.query('form').classList.add('form-horizontal')
  },
  focus () {
    this.query('input[name=password]').focus()
  }
})
