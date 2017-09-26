import App from 'ampersand-app'
import View from 'ampersand-view'
import FormView from 'ampersand-form-view'
import InputView from 'ampersand-input-view'
import AuthActions from 'actions/auth'
import validator from 'validator'

const registerForm = FormView.extend({
  autoRender: true,
  initialize() {
    this.fields = [
      new InputView({
        type:'email',
        placeholder: 'Email',
        name: 'email',
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        autofocus: true,
        tests: [
          function (value) {
            if (!validator.isEmail(value)) {
              return "Must be an email.";
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
    formSwitch: ['boolean',false,false]
  },
  bindings: {
    formSwitch: [
      {
        type: 'toggle',
        hook: 'register-form-container',
        invert: true
      },
      {
        type: 'toggle',
        hook: 'result-container',
      }
    ]
  },
  initialize () {
    this.formSwitch = App.state.register.result
    this.listenTo(App.state.register, 'change:result', () => {
    this.formSwitch = App.state.register.result
    })
  },
  template: require('./template.hbs'),
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
