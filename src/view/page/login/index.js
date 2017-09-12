import View from 'ampersand-view'
import FormView from 'ampersand-form-view'
import InputView from 'ampersand-input-view'
import NavBar from '../navbar'
import AuthActions from 'actions/auth'

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

export default View.extend({
  autoRender: true,
  template: require('./template.hbs'),
  props: {
    formSwitch: ['boolean',false,true]
  },
  bindings: {
    formSwitch: [
      {
        type: 'toggle',
        hook: 'login-form-container'
      },
      {
        type: 'toggle',
        hook: 'forgot-form-container',
        invert: true
      }
    ]
  },
  events: {
    'click [data-hook=form-toggle]': function (event) {
      event.preventDefault()
      event.stopPropagation()
      this.toggle('formSwitch')
    },
    'click button[data-hook=start-login]': function (event) {
      event.preventDefault()
      event.stopPropagation()
      this.loginForm.beforeSubmit()
      if (this.loginForm.valid) {
        var data = this.loginForm.data
        AuthActions.login(data)
      }
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
  render() {
    this.renderWithTemplate(this)

    this.loginForm = new LoginForm({})
    this.forgotForm = new ForgotForm({})

    this.renderSubview(new NavBar({}), this.queryByHook('navbar-container'))
    this.renderSubview(this.loginForm, this.queryByHook('login-form'))
    this.renderSubview(this.forgotForm, this.queryByHook('forgot-form'))

  }
})
