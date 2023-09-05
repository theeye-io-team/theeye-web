import FormView from 'ampersand-form-view'
import SelectView from 'components/select2-view'
import InputView from 'components/input-view'
import Collection from 'ampersand-collection'
import CheckboxView from 'components/checkbox-view'
import App from 'ampersand-app'
import isEmail from 'validator/lib/isEmail'
import ConstantsView from 'view/constants'

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
        value: this.model.enabled
      }),
      new ConstantsView({
        outputFormat: 'array',
        name: 'tags',
        copyButton: false,
        exportButton: false,
        label: 'Tags',
        values: this.model.tags
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
  }
})
