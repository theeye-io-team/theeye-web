import App from 'ampersand-app'
import View from 'ampersand-view'
import FormView from 'ampersand-form-view'
import InputView from 'ampersand-input-view'
import AuthActions from 'actions/auth'
import validator from 'validator'

const passwordForm = FormView.extend({
  autoRender: true,
  initialize() {
    const passwordInput = new InputView({
      type: 'password',
      placeholder: 'Password',
      name: 'password',
      required: true,
      invalidClass: 'text-danger',
      validityClassSelector: '.control-label',
      tests: [
        function (value) {
          if (value.length < 8) {
            return "Must have at least 8 characters.";
          }
        }
      ]
    })

    this.fields = [
      passwordInput,
      new InputView({
        type: 'password',
        placeholder: 'Confirm password',
        name: 'confirmation',
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        tests: [
          function (value) {
            if (value !== passwordInput.value) {
              return "Password does not match.";
            }
          }
        ]
      })
    ]
    FormView.prototype.initialize.apply(this, arguments)
  }
})

module.exports = View.extend({
  autoRender: true,
  initialize () {

  },
  template: require('./template.hbs'),
  events: {
    'click button[data-hook=reset-password]': function (event) {
      event.preventDefault()
      event.stopPropagation()
      this.passwordForm.beforeSubmit()
      if (this.passwordForm.valid) {
        var data = this.passwordForm.data
        data.token = App.state.passwordReset.token
        AuthActions.resetPassword(data)
      }
    }
  },
  render() {
    this.renderWithTemplate(this)
    this.passwordForm = new passwordForm({})
    this.renderSubview(this.passwordForm, this.queryByHook('password-form'))
  }
})
