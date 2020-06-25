import App from 'ampersand-app'
import View from 'ampersand-view'
import FormView from 'ampersand-form-view'
import InputView from 'ampersand-input-view'
import validator from 'validator'

export default View.extend({
  template: () => {
    let html = `
      <div class="login-container">
        <div class="container">
          <div class="login-main">
            <div data-hook="login-form-container">
              <div class="row">
                <div class="col-xs-12">
                  <h1 class="reset-title">Reset account password</h1>
                </div>
              </div>
              <div class="row">
                <div class="col-xs-12">
                  <div class="form-wrapper">
                    <div data-hook="password-form" class="form-container"></div>
                    <button data-hook="reset-password">Submit</button>
                    <a cclass="login-link" href='/login'><h2>Back to login</h2></a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
    return html
  },
  events: {
    'click button[data-hook=reset-password]': function (event) {
      event.preventDefault()
      event.stopPropagation()
      this.passwordForm.beforeSubmit()
      if (this.passwordForm.valid) {
        var data = this.passwordForm.data
        data.token = App.state.passwordReset.token
        App.actions.auth.resetPassword(data)
      }
    }
  },
  render() {
    this.renderWithTemplate(this)
    this.passwordForm = new passwordForm({})
    this.renderSubview(this.passwordForm, this.queryByHook('password-form'))
  }
})

const passwordForm = FormView.extend({
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
