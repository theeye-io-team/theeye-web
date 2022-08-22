import View from 'ampersand-view'
import FormView from 'ampersand-form-view'
import InputView from 'ampersand-input-view'
import App from 'ampersand-app'
import Labels from 'language/titles'

import './style.less'

import logo from './logo.svg'

export default View.extend({
  template: () => {
    let html = `
      <div data-component="login" class="login-container">
        <div class="logo-container">
          <img src="${logo}" class="theeye-logo" alt="TheEye">
          <h1 class="title">Sign In to TheEye App</h1>
        </div>
        <div class="login-form-container">
          <div class="login-main" data-hook="login-options-container">
            <div data-hook="login-form-container">
             <h2 class="subtitle">Sign in</h2> 
              <div data-hook="social-login-container" class="row"> </div>
              <div class="row">
                <div class="col-xs-12">
                  <div class="form-wrapper">
                    <div data-hook="login-form" class="form-container"></div>
                    <button data-hook="start-login">Sign in</button>
                  </div>
                </div>
              </div>
            </div>
           <div data-hook="links-container"></div> 
          </div>
        </div>
      </div>
    `
    return html
  },
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
        hook: 'password-view-toggle',
        invert: true
      },
      {
        type: 'toggle',
        hook: 'password-view-container'
      }
    ]
  },
  events: {
    'click [data-hook=password-view-toggle]': function (event) {
      App.actions.auth.togglePasswordLoginForm()
    },
    'click button[data-hook=start-login]': function (event) {
      event.preventDefault()
      event.stopPropagation()
      this.submitLogin()
    },
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

    App.state.loader.visible = false

    this.renderLoginForm()

    const container = this.queryByHook('links-container')
    const loginConfig = App.config.components.login

    if (loginConfig.password_reset.enabled === true) {
      this.renderForgotPasswordView(container)
    }

    if (loginConfig.registration.enabled === true) {
      this.renderRegiterButton(container)
    }

    if (loginConfig.enterprise.enabled === true) {
      this.renderEnterpriseButton(container)
    }

    if (loginConfig.google.enabled === true) {
      this.renderGoogleLogin()
    }

    // document.getElementsByTagName('body')[0].style.backgroundColor = '#304269'
    App.actions.navbar.setVisibility(false)
  },
  renderGoogleLogin () {
    const view = new GoogleLogin()
    view.render()
    this.renderSubview(view, this.queryByHook('social-login-container'))
  },
  renderLoginForm () {
    this.loginForm = new LoginForm({})
    this.listenTo(this.loginForm, 'submit', () => { this.submitLogin() })
    this.renderSubview(this.loginForm, this.queryByHook('login-form'))
  },
  renderForgotPasswordView (container) {
    const template = `
      <div data-component="password-reset-link">
        <a class="login-toggle" data-hook="password-view-toggle">Forgot password?</a>
        <div style="display:none;" data-hook="password-view-container"></div>
      </div>
    `

    const el = document.createElement('div')
    el.innerHTML = template
    container.appendChild(el)

    const passwordView = new ForgotPasswordView()
    passwordView.render()
    this.registerSubview(passwordView)

    el.querySelector('[data-hook=password-view-container]').appendChild(passwordView.el)
  },
  renderEnterpriseButton (container) {
    const template = '<h2 class="login-link">Enterprise? <a href="/enterprise">Access here</a></h2>'
    const el = document.createElement('div')
    el.innerHTML = template
    container.appendChild(el)
  },
  renderRegiterButton (container) {
    const template = '<h2 class="register-link">Don\'t have an account? <a href="/register">Register here</a></h2>'
    const el = document.createElement('div')
    el.innerHTML = template
    container.appendChild(el)
  }
})

const LoginForm = FormView.extend({
  autoRender: true,
  initialize() {
    let labels
    if (App.config.components.login.domain.enabled === true) {
      labels = Labels.login.form.domain
    } else {
      labels = Labels.login.form.local
    }

    this.fields = [
      new InputView({
        placeholder: labels.username_placeholder,
        name: 'username',
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        autofocus: true
      }),
      new InputView({
        placeholder: labels.password_placeholder,
        type: 'password',
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

const ForgotPasswordView = View.extend({
  template: `
    <div data-component="forgot-password">
      <div class="row">
        <div class="col-xs-12">
          <h1>Password reset</h1>
        </div>
      </div>
      <div class="row">
        <div class="col-xs-12">
          <h2>Please enter your account email</h2>
          <div class="form-wrapper">
            <div data-hook="form-container" class="form-container"></div>
            <button data-hook="start-forgot">Send Email</button>
            <h2>
              <a class="login-toggle" data-hook="login-form-toggle">Back</a>
            </h2>
          </div>
        </div>
      </div>
    </div>
  `,
  render () {
    this.renderWithTemplate(this)
    this.forgotForm = new ForgotForm({})
    this.renderSubview(this.forgotForm, this.queryByHook('form-container'))
  },
  events: {
    'click button[data-hook=start-forgot]': function (event) {
      event.preventDefault()
      event.stopPropagation()
      this.forgotForm.beforeSubmit()
      if (this.forgotForm.valid) {
        const data = this.forgotForm.data
        App.actions.auth.recoverPassword(data)
      }
    },
    'click [data-hook=login-form-toggle]': function (event) {
      App.actions.auth.togglePasswordLoginForm()
    },
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

const GoogleLogin = View.extend({
  template: `
    <div class="col-xs-12">
      <a href="" class="sign google" data-hook="google-login"><i class="fa fa-google"></i> Google</a>
      <hr>
    </div>
  `,
  events: {
    'click [data-hook=google-login]': function (event) {
      event.preventDefault()
      event.stopPropagation()
      App.actions.auth.loginProvider('google')
    },
  }
})
