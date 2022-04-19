import FormView from 'ampersand-form-view'
import InputView from 'components/input-view'
import CheckboxView from 'components/checkbox-view'
import isURL from 'validator/lib/isURL'
import SelectView from 'components/select2-view'

const ngrokProtocols = [
  {
    id: 'http',
    text: 'http' 
  },{
    id: 'tcp',
    text: 'tcp' 
  },{
    id: 'tls',
    text: 'tls' 
  }
]

export default FormView.extend({
  initialize: function (options) {
    let enabled = new CheckboxView({
      name: 'enabled',
      label: 'Enabled',
      value: this.model.enabled
    })

    this.fields = [
      enabled,
      new InputView({
        name: 'authtoken',
        label: 'Authentication Token',
        placeholder: 'your authtoken from ngrok.com',
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: this.model.authtoken,
        required: false,
        tests: [
          (value) => {
            if (enabled.value === true && !value) {
              return 'This field is required'
            }
          }
        ]
      }),
      new SelectView({
        value: this.model.protocol,
        options: ngrokProtocols,
        name: 'protocol',
        label: 'Protocol',
        unselectedText: 'http|tcp|tls',
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
				styles: 'form-group',
        required: false,
        tests: [
          (value) => {
            if (enabled.value === true && !value) {
              return 'This field is required'
            }
          }
        ]
      }),
      new InputView({
        name: 'address',
        label: 'Address',
        placeholder: 'port or network address',
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: this.model.address,
        required: false,
        tests: [
          (value) => {
            if (enabled.value === true && !value) {
              return 'This field is required'
            }
          }
        ]
      }),
    ]

    FormView.prototype.initialize.apply(this, arguments)
  },
  render () {
    FormView.prototype.render.apply(this, arguments)
    this.query('form').classList.add('form-horizontal')

    let _enabled = this._fieldViews.enabled
    this.listenToAndRun(_enabled, 'change:value', () => {
      this.beforeSubmit()
    })
  },
  focus () {
    this.query('input[name=enabled]').focus()
  }
})
