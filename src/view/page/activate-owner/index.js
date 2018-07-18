import View from 'ampersand-view'
import FormView from 'ampersand-form-view'
import InputView from 'ampersand-input-view'
import AuthActions from 'actions/auth'
import NavbarActions from 'actions/navbar'
import App from 'ampersand-app'
import validator from 'validator'
import activationLang from 'language/activation'

const ActivateForm = FormView.extend({
  autoRender: true,
  initialize () {
    const passwordInput = new InputView({
      type: 'password',
      placeholder: activationLang.getText('password'),
      name: 'password',
      required: true,
      invalidClass: 'text-danger',
      validityClassSelector: '.control-label',
      tests: [
        function (value) {
          if (value.length < 8) {
            return activationLang.getText('passwordLengthError')
          }
        }
      ]
    })

    const usernameInput = new InputView({
      placeholder: activationLang.getText('username'),
      name: 'username',
      required: true,
      invalidClass: 'text-danger',
      validityClassSelector: '.control-label',
      autofocus: true,
      requiredMessage: activationLang.getText('usernameMissing'),
      tests: [
        function (value) {
          if (validator.isEmpty(value)) {
            return activationLang.getText('usernameMissing')
          }
        }
      ]
    })

    this.fields = [
      usernameInput,
      passwordInput,
      new InputView({
        type: 'password',
        placeholder: activationLang.getText('confirmPassword'),
        name: 'confirmPassword',
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        tests: [
          function (value) {
            if (value !== passwordInput.value) {
              return activationLang.getText('passwordMatchError')
            }
          },
          function (value) {
            if (value.length < 8) {
              return activationLang.getText('passwordLengthError')
            }
          }
        ]
      })
    ]

    this.listenTo(App.state.activate, 'change:username', () => {
      usernameInput.setValue(App.state.activate.username)
    })

    FormView.prototype.initialize.apply(this, arguments)
  }
})

const SetCustomerForm = FormView.extend({
  autoRender: true,
  initialize () {
    const customerInput = new InputView({
      placeholder: activationLang.getText('organization'),
      name: 'customer',
      required: true,
      invalidClass: 'text-danger',
      validityClassSelector: '.control-label',
      value: App.state.activate.username
    })
    this.fields = [
      customerInput
    ]

    this.listenTo(App.state.activate, 'change:username', () => {
      customerInput.setValue(App.state.activate.username)
    })

    FormView.prototype.initialize.apply(this, arguments)
  }
})

module.exports = View.extend({
  initialize () {
    View.prototype.initialize.apply(this, arguments)
    this.username = App.state.activate.username

    this.template = `
      <div class="activate-container">
        <div class="activate-header">
          <div class="container">
            <div class="row">
              <div class="col-xs-12">
                <img class="logo" src="/images/logo.png" alt="TheEye">
              </div>
            </div>
            <div class="row">
              <div class="col-xs-12">
                <h1>${activationLang.getText('headerTitle')}</h1>
              </div>
            </div>
          </div>
        </div>
        <div class="container">
          <div class="activate-main">
            <div class="row">
              <div class="col-xs-12">
                <h1>${activationLang.getText('title')}</h1>
              </div>
            </div>
            <div class="row"  data-hook="activate-form-container">
              <div class="col-xs-12">
                <h2>${activationLang.getText('subtitle')}</h2>
                <div class="form-wrapper">
                  <div data-hook="activate-form" class="form-container"></div>
                  <button data-hook="show-customer">${activationLang.getText('btnNext')}</button>
                </div>
              </div>
            </div>
            <div class="row" data-hook="customer-form-container">
              <div class="col-xs-12">
                <h2>${activationLang.getText('orgTitle')}</h2>
                <div class="form-wrapper">
                  <div data-hook="customer-form" class="form-container"></div>
                  <button data-hook="start-activate">${activationLang.getText('btnFinish')}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `

    this.listenTo(App.state.activate, 'change:finalStep', () => {
      if(App.state.activate.finalStep) {
        this.toggle('formSwitch')
      }
    })
  },
  autoRender: true,
  props: {
    token: ['string',false,''],
    formSwitch: ['boolean',false,true],
    username: ['string',false,'']
  },
  bindings: {
    formSwitch: [
      {
        type: 'toggle',
        hook: 'activate-form-container'
      },
      {
        type: 'toggle',
        hook: 'customer-form-container',
        invert: true
      }
    ]
  },
  events: {
    'click button[data-hook=show-customer]': function (event) {
      event.preventDefault()
      event.stopPropagation()
      this.activateForm.beforeSubmit()
      if (this.activateForm.valid) {
        AuthActions.checkUsernameActivation(this.activateForm.data.username, App.state.activate.invitation_token)
      }
    },
    'click button[data-hook=start-activate]': function (event) {
      event.preventDefault()
      event.stopPropagation()
      this.activateForm.beforeSubmit()
      if (this.customerForm.valid) {
        var data = {
          username: App.state.activate.username,
          password: this.activateForm.data.password,
          invitation_token: App.state.activate.invitation_token,
          customername: this.customerForm.data.customer
        }
        AuthActions.activateStep(data, this.token)
      }
    }
  },
  render() {
    this.renderWithTemplate(this)
    this.activateForm = new ActivateForm()
    this.customerForm = new SetCustomerForm()

    this.renderSubview(this.activateForm, this.queryByHook('activate-form'))
    this.renderSubview(this.customerForm, this.queryByHook('customer-form'))

    NavbarActions.setVisibility(false)
  }
})
