import App from 'ampersand-app'
import View from 'ampersand-view'
import FormView from 'ampersand-form-view'
import InputView from 'ampersand-input-view'
import AuthActions from 'actions/auth'
import validator from 'validator'

import logoCustomer1 from './customers-logo-comafi.png'
import logoCustomer2 from './customers-logo-colppy.png'
import logoCustomer3 from './customers-logo-ente.png'
import logoCustomer4 from './customers-logo-ign.png'
import logoCustomer5 from './customers-logo-invap.png'
const template = require('./template.hbs')

const registerForm = FormView.extend({
  autoRender: true,
  initialize() {
    this.fields = [
      new InputView({
        type:'name',
        placeholder: 'Nombre',
        name: 'name',
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        autofocus: true,
        tests: [
          function (value) {
            if (validator.isEmpty(value)) {
              return "Por favor, ingresa tu nombre.";
            }
          }
        ] 
      }),    
      new InputView({
        type:'email',
        placeholder: 'Email',
        name: 'email',
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        autofocus: false,
        tests: [
          function (value) {
            if (!validator.isEmail(value)) {
              return "El email ingresado es inv&aacute;lido";
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
  props: {
    formSwitch: ['boolean',false,false],
    message: ['string',false,'']
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
        hook: 'register-form-container',
        invert: true
      },
      {
        type: 'toggle',
        hook: 'result-container',
      }
    ],
    'message': {
      type: 'text',
      hook: 'result-message'
    }
  },
  initialize () {
    this.formSwitch = App.state.register.result
    this.listenTo(App.state.register, 'change:result', () => {
      this.formSwitch = App.state.register.result
    })
    this.listenTo(App.state.register, 'change:message', () => {
      this.message = App.state.register.message
    })
  },
  // template: require('./template.hbs'),
  template: () => {
    return template.call(this, { 
      logoCustomer1: logoCustomer1, 
      logoCustomer2: logoCustomer2, 
      logoCustomer3: logoCustomer3,
      logoCustomer4: logoCustomer4,
      logoCustomer5: logoCustomer5
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
  render() {
    this.renderWithTemplate(this)
    this.registerForm = new registerForm({})
    this.renderSubview(this.registerForm, this.queryByHook('register-form'))
  }
})
