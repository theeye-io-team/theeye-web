import View from 'ampersand-view'
import FormView from 'ampersand-form-view'
import InputView from 'ampersand-input-view'
import NavbarActions from 'actions/navbar'
import App from 'ampersand-app'

export default View.extend({
  template: () => {
    let html = `
      <div class="login-container">
        <div class="container">
          <div class="login-main">
            <div data-hook="login-form-container">
              <div class="row">
                <div class="col-xs-12">
                  <h1>Sign In to TheEye App</h1>
                  <a href="" class="sign google" data-hook="google-login"><i class="fa fa-google-plus"></i>Google+</a>
                  <h2 class="or"> - or - </h2>
                </div>
              </div>
              <div class="row">
                <div class="col-xs-12">
                  <div class="form-wrapper">
                    <div data-hook="login-form" class="form-container"></div>
                    <button data-hook="start-login">Sign in</button>
                    <h2 class="login-toggle" data-hook="form-toggle">Forgot password?</h2>
                  </div>
                </div>
              </div>
            </div>
            <div data-hook="forgot-form-container">
              <div class="row">
                <div class="col-xs-12">
                  <h1>Password reset</h1>
                </div>
              </div>
              <div class="row">
                <div class="col-xs-12">
                  <h2>Please enter your account email</h2>
                  <div class="form-wrapper">
                    <div data-hook="forgot-form" class="form-container"></div>
                    <button data-hook="start-forgot">Send email</button>
                    <h2 class="login-toggle" data-hook="form-toggle">Back</h2>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <a href="/register"><h2 class="register-link">Don't have an account? Register here</h2></a>
            </div>
          </div>
        </div>
      </div>
    `
    return html
  },
  //autoRender: true,
  props: {
    formSwitch: ['boolean', false, false]
  },
  bindings: {
    formSwitch: [
      {
        type: 'toggle',
        hook: 'login-form-container',
        invert: true
      },
      {
        type: 'toggle',
        hook: 'forgot-form-container'
      }
    ]
  },
  events: {
    'click [data-hook=form-toggle]': function (event) {
      App.actions.auth.toggleLoginForm()
    },
    'click [data-hook=google-login]': function (event) {
      event.preventDefault()
      event.stopPropagation()
      App.actions.auth.loginProvider('google')
    },
    'click button[data-hook=start-login]': function (event) {
      event.preventDefault()
      event.stopPropagation()
      this.submitLogin()
    },
    'click button[data-hook=start-forgot]': function (event) {
      event.preventDefault()
      event.stopPropagation()
      this.forgotForm.beforeSubmit()
      if (this.forgotForm.valid) {
        var data = this.forgotForm.data
        App.actions.auth.recoverPassword(data)
      }
    }
  },
  submitLogin () {
    this.loginForm.beforeSubmit()
    if (this.loginForm.valid) {
      var data = this.loginForm.data
      App.actions.auth.login(data)
    }
  },
  initialize() {
    this.formSwitch = App.state.login.showRecoverForm
    this.listenTo(App.state.login, 'change:showRecoverForm', () => {
      this.toggle('formSwitch')
    })
  },
  render() {
    this.renderWithTemplate(this)

    this.loginForm = new LoginForm({})
    this.forgotForm = new ForgotForm({})

    this.listenTo(this.loginForm, 'submit', () => { this.submitLogin() })

    this.renderSubview(this.loginForm, this.queryByHook('login-form'))
    this.renderSubview(this.forgotForm, this.queryByHook('forgot-form'))
    App.state.loader.visible = false

    document.getElementsByTagName('body')[0].style.backgroundColor = '#304269'
    NavbarActions.setVisibility(true)
  }
})

const LoginForm = FormView.extend({
  autoRender: true,
  initialize() {
    this.fields = [
      new InputView({
        placeholder: 'User or email',
        name: 'username',
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        autofocus: true
      }),
      new InputView({
        type: 'password',
        placeholder: 'Password',
        name: 'password',
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label'
      })
    ]
    FormView.prototype.initialize.apply(this, arguments)
  },
  events: {
    'keyup': onkeyup
  },
  onkeyup (event) {
    if (event.keyCode == 13) { // enter
      this.submit()
    }
  },
  submit () {
    this.trigger('submit')
  }
})

const ForgotForm = FormView.extend({
  autoRender: true,
  initialize() {
    this.fields = [
      new InputView({
        type: 'email',
        placeholder: 'Email',
        name: 'email',
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label'
      })
    ]
    FormView.prototype.initialize.apply(this, arguments)
  }
})
