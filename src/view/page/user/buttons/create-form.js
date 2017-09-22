import FormView from 'ampersand-form-view'
import SelectView from 'components/select2-view'
import InputView from 'components/input-view'
import Collection from 'ampersand-collection'
import TheeyeCheckboxView from 'components/theeye-checkbox-view'
import App from 'ampersand-app'

module.exports = FormView.extend({
  initialize: function (options) {
    this.fields = [
      new InputView({
        name: 'username',
        label: 'Username',
        value: this.model.username,
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label'
      }),
      new InputView({
        name: 'email',
        label: 'Email',
        value: this.model.email,
        tests: [
          function (value) {
            const regex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
            if (!regex.test(value)) {
              return 'Please provide a valid email'
            }
          }
        ],
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label'
      }),
      new SelectView({
        multiple: true,
        tags: true,
        options: App.state.customers,
        styles: 'form-group',
        name: 'customers',
        required: true,
        label: 'Customers',
        value: '',
        unselectedText: 'organizations',
        idAttribute: 'id',
        textAttribute: 'name',
        requiredMessage: 'Selection required',
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label'
      }),
      new SelectView({
        options: App.state.credentials.filter( e => {
          return (e.name !== 'owner')
        }),
        styles: 'form-group',
        name: 'credential',
        required: true,
        label: 'Credential',
        value: '',
        unselectedText: 'credential',
        idAttribute: 'name',
        textAttribute: 'name',
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label'
      }),
      new TheeyeCheckboxView({
        name: 'enabled',
        label: 'Enabled',
        value: false
      })
    ]
    FormView.prototype.initialize.apply(this, arguments)
  },
  render () {
    FormView.prototype.render.apply(this, arguments)
    this.query('form').classList.add('form-horizontal')
  },
  focus () {
    this.query('input[name=username]').focus()
  },
  events: {
    'change input[name=enabled]': function (event) {
      this.togglePasswordFields(event.target.checked)
    }
  },
  togglePasswordFields: function (on) {
    if (on) {
      const pass = new InputView({
        name: 'password',
        type: 'password',
        label: 'Password',
        value: '',
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label'
      })
      const passConfirm = new InputView({
        name: 'confirmPassword',
        type: 'password',
        label: 'Confirm',
        value: '',
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        tests: [
          function (value) {
            const passval = pass.value
            if (value != passval) {
              return 'Passwords doesn\'t match'
            }
          }
        ]
      })
      this.addField(pass)
      this.renderField(pass)
      this.addField(passConfirm)
      this.renderField(passConfirm)
    } else {
      this.getField('password').remove()
      this.removeField('password')
      this.getField('confirmPassword').remove()
      this.removeField('confirmPassword')
    }
  },
})
