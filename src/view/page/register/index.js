import App from 'ampersand-app'
import View from 'ampersand-view'
import FormView from 'ampersand-form-view'
import InputView from 'ampersand-input-view'
import AuthActions from 'actions/auth'
import NavbarActions from 'actions/navbar'
import validator from 'validator'
import registerLang from 'language/register'
import RecaptchaInputView from 'components/input-view/grecaptcha'

export default View.extend({
  autoRender: true,
  props: {
    formSwitch: ['boolean', false, false]
  },
  bindings: {
    formSwitch: [
      {
        type: 'toggle',
        hook: 'register-content',
        invert: true
      },
      {
        type: 'toggle',
        hook: 'result-container'
      }
    ]
  },
  template: () => {
    return `
      <div class="register-container container">
        <div class="register-header">
          <div class="row">
            <div class="col-xs-12">
              <img class="logo" src="/images/logo.png" alt="TheEye">
            </div>
          </div>
          <div class="row">
            <div class="col-xs-12">
              <h1>${registerLang.getText('title')}</h1>
            </div>
          </div>
        </div>
        <div class="register-main" data-hook="register-content">
          <div class="row">
            <div class="col-xs-12">
              <h1>${registerLang.getText('subtitle1')}</br>${registerLang.getText('subtitle2')}</h1>
            </div>
          </div>
          <div class="row">
            <div class="col-xs-12 col-md-7 list-col">
              <h2>${registerLang.getText('listTitle')}</h2>
              <p>${registerLang.getText('listItem1')}</p>
              <p>${registerLang.getText('listItem2')}</p>
              <p>${registerLang.getText('listItem3')}</p>
              <p>${registerLang.getText('listItem4')}</p>
            </div>
            <div class="col-xs-12 col-md-5 form-col">
              <h2>${registerLang.getText('formTitle')}</h2>
              <div class="form-container">
                <div class="row">
                  <div class="col-xs-12">
                    <div data-hook="register-form"></div>
                  </div>
                </div>
                <div class="row">
                  <div class="col-xs-12">
                    <button data-hook="start-register">${registerLang.getText('registerButton')}</button>
                  </div>
                </div>
                <div class="row">
                  <div class="col-xs-12 form-below">
                    <span>${registerLang.getText('goToLogin')}</span> <a href='/login'>${registerLang.getText('goToLoginLink1')}</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        <div class="register-main" data-hook="result-container">
          <div class="result-container">
            <div class="row">
              <div class="col-xs-12">
                <h1>${registerLang.getText('thanks')}</h1>
                <h2>${registerLang.getText('success1')}</h2>
                <h2>${registerLang.getText('success2')}</br>${registerLang.getText('success3')}</h2>
              </div>
            </div>
            <div class="row btn-container">
              <div class="col-xs-12">
                <a href="/login">${registerLang.getText('goToLoginLink2')}</a>
              </div>
            </div>
          </div>
        </div>
      </div>

    `
  },
  initialize () {
    this.formSwitch = App.state.register.result
    this.listenTo(App.state.register, 'change:result', () => {
      this.formSwitch = App.state.register.result
    })
  },
  events: {
    'click button[data-hook=start-register]': function (event) {
      event.preventDefault()
      event.stopPropagation()
      this.registerForm.beforeSubmit()
      if (this.registerForm.valid) {
        var data = this.registerForm.data
        AuthActions.register(data)
      }
    }
  },
  render () {
    this.renderWithTemplate(this)
    this.registerForm = new RegisterForm({})
    this.renderSubview(this.registerForm, this.queryByHook('register-form'))

    document.getElementsByTagName('body')[0].style.backgroundColor = '#fafafa'
    NavbarActions.setVisibility(false)
  }
})

const RegisterForm = FormView.extend({
  initialize () {
    this.fields = [
      new InputView({
        type: 'name',
        placeholder: registerLang.getText('name'),
        name: 'name',
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        autofocus: true,
        requiredMessage: registerLang.getText('nameMissing'),
        tests: [
          function (value) {
            if (validator.isEmpty(value)) {
              return registerLang.getText('nameMissing')
            }
          }
        ]
      }),
      new InputView({
        type: 'email',
        placeholder: registerLang.getText('email'),
        name: 'email',
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        autofocus: false,
        requiredMessage: registerLang.getText('emailMissing'),
        tests: [
          function (value) {
            if (!validator.isEmail(value)) {
              return registerLang.getText('emailInvalid')
            }
          }
        ]
      }),
      new RecaptchaInputView({ })
    ]

    window.form = this
    FormView.prototype.initialize.apply(this, arguments)
  }
})
