import View from 'ampersand-view'
import FormView from 'ampersand-form-view'
import InputView from 'ampersand-input-view'
import AuthActions from 'actions/auth'
import App from 'ampersand-app'

const ActivateForm = FormView.extend({
  autoRender: true,
  initialize () {
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
            return "Must have at least 8 characters";
          }
        }
      ]
    })

    const usernameInput = new InputView({
      placeholder: 'Username',
      name: 'username',
      required: true,
      invalidClass: 'text-danger',
      validityClassSelector: '.control-label',
      autofocus: true
    })

    this.fields = [
      usernameInput,
      passwordInput,
      new InputView({
        type: 'password',
        placeholder: 'Confirm password',
        name: 'confirmPassword',
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        tests: [
          function (value) {
            if (value !== passwordInput.value) {
              return "Password does not match.";
            }
          },
          function (value) {
            if (value.length < 8) {
              return "Must have at least 8 characters";
            }
          }
        ]
      })
    ]

    FormView.prototype.initialize.apply(this, arguments)
  }
})

module.exports = View.extend({
  initialize () {
    View.prototype.initialize.apply(this,arguments)
    this.username = App.state.activate.username
  },
  autoRender: true,
  template: require('./template.hbs'),
  props: {
    token: ['string',false,''],
    username: ['string',false,'']
  },
  events: {
    'click button[data-hook=start-activate]': function (event) {
      event.preventDefault()
      event.stopPropagation()
      this.activateForm.beforeSubmit()
      if (this.activateForm.valid) {
        var data = this.activateForm.data
        data.invitation_token = App.state.activate.invitation_token
        AuthActions.activateStep(data, this.token)
      }
    }
  },
  render() {
    this.renderWithTemplate(this)
    this.activateForm = new ActivateForm()
    this.renderSubview(this.activateForm, this.queryByHook('activate-form'))
  }
})
