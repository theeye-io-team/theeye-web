import FormView from 'ampersand-form-view'
import SelectView from 'components/select2-view'
import InputView from 'components/input-view'
import Collection from 'ampersand-collection'
import CheckboxView from 'components/checkbox-view'
import App from 'ampersand-app'
import isEmail from 'validator/lib/isEmail'

export default FormView.extend({
  initialize: function (options) {
    this.fields = [
      new InputView({
        name: 'name',
        label: 'Name',
        value: this.model.name,
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label'
      }),
      new InputView({
        name: 'username',
        label: 'Username',
        value: this.model.username,
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        tests: [
          function (value) {
            if (!isEmail(value) && !isEmail(value + '@theeye.io')) {
              return 'Please provide a valid username'
            }
          }
        ]
      }),
      new InputView({
        name: 'email',
        label: 'Email',
        value: this.model.email,
        tests: [
          function (value) {
            if (!isEmail(value)) {
              return 'Please provide a valid email'
            }
          }
        ],
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label'
      }),
      new CheckboxView({
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
    this.query('input[name=name]').focus()
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
        validityClassSelector: '.control-label',
        tests: [
          function (value) {
            if (value.length < 8) {
              return "Must have at least 8 characters";
            }
          }
        ]
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
          },
          function (value) {
            if (value.length < 8) {
              return "Must have at least 8 characters";
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
