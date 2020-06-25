import FormView from 'ampersand-form-view'
import InputView from 'components/input-view'
import CheckboxView from 'components/checkbox-view'
import SelectView from 'components/select2-view'
import isURL from 'validator/lib/isURL'

export default FormView.extend({
  initialize (options) {
    let enabled = new CheckboxView({
      name: 'enabled',
      label: 'Enabled',
      value: this.model.enabled
    })

    this.fields = [
      enabled,
      new InputView({
        name: 'url',
        label: 'URL',
        placeholder: 'Remote URL',
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: this.model.url,
        required: false,
        tests: [
          (value) => {
            if (enabled.value === true) {
              if (!value) {
                return 'This field is required'
              }

              if (!isURL(value)) {
                return 'Valid URL is required'
              }
            }
          }
        ]
      })
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
