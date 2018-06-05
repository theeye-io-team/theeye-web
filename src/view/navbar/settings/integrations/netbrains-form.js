import FormView from 'ampersand-form-view'
import InputView from 'components/input-view'
import CheckboxView from 'components/checkbox-view'
import isURL from 'validator/lib/isURL'

module.exports = FormView.extend({
  initialize: function (options) {
    const netbrainsConfig = this.model.config.netbrains || {}
    this.fields = [
      new CheckboxView({
        name: 'netbrains_enabled',
        label: 'Netbrains enabled',
        value: Boolean(netbrainsConfig.enabled)
      }),
      new InputView({
        name: 'netbrains_url',
        label: 'Netbrains url',
        placeholder: 'Netbrains url',
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        required: true,
        value: netbrainsConfig.url || '',
        tests: [
          function (value) {
            if (!isURL(value, {
              protocols: ['http', 'https'],
              require_protocol: true
            })) {
              return 'Must be a valid URL (include protocol)'
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
  },
  focus () {
    this.query('input[name=netbrains_url]').focus()
  }
})
