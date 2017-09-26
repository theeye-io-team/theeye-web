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
      placeholder: 'Organization name',
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
    View.prototype.initialize.apply(this,arguments)
    this.username = App.state.activate.username

    this.listenTo(App.state.activate, 'change:finalStep', () => {
      if(App.state.activate.finalStep) {
        this.toggle('formSwitch')
      }
    })
  },
  autoRender: true,
  template: require('./template.hbs'),
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
  }
})
