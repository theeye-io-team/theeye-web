import View from 'ampersand-view'
import FormView from 'ampersand-form-view'
import InputView from 'ampersand-input-view'
import AuthActions from 'actions/auth'
import App from 'ampersand-app'

const LoginForm = FormView.extend({
  autoRender: true,
  initialize() {
    this.fields = [
      new InputView({
        placeholder: 'User or email',
        name: 'identifier',
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

module.exports = View.extend({
  autoRender: true,
  template: require('./template.hbs'),
  props: {
    formSwitch: ['boolean',false,false]
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
        hook: 'forgot-form-container',
      }
    ]
  },
  events: {
    'click [data-hook=form-toggle]': function (event) {
      AuthActions.toggleLoginForm()
    },
    'click [data-hook=google-login]': function (event) {
      event.preventDefault()
      event.stopPropagation()
      AuthActions.providerLogin('google')
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
        AuthActions.resetMail(data)
      }
    }
  },
  submitLogin () {
    this.loginForm.beforeSubmit()
    if (this.loginForm.valid) {
      var data = this.loginForm.data
      AuthActions.login(data)
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
  }
})
