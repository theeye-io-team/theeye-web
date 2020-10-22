import FormView from 'ampersand-form-view'
import InputView from 'components/input-view'
import CheckboxView from 'components/checkbox-view'
import isURL from 'validator/lib/isURL'
import HelpIcon from 'components/help-icon'
import HelpTexts from 'language/help'

export default FormView.extend({
  initialize: function (options) {
    this.fields = [
      new CheckboxView({
        name: 'enabled',
        label: 'Enable Logger',
        value: this.model.enabled
      }),
      new InputView({
        name: 'url',
        label: 'Remote Logger URL',
        placeholder: 'remote url to submit generated information',
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        required: true,
        value: this.model.url,
        tests: [
          function (value) {
            if (!isURL(value, {
              protocols: ['http','https'],
              require_protocol: true
            })) {
              return "Must be a valid URL (include protocol)"
            }
          }
        ]
      })
    ]
    FormView.prototype.initialize.apply(this, arguments)
  },
  addHelpIcon (field) {
    const view = this._fieldViews[field]
    if (!view) return
    view.renderSubview(
      new HelpIcon({
        text: HelpTexts.integrations.logger[field]
      }),
      view.query('label')
    )
  },
  render () {
    FormView.prototype.render.apply(this, arguments)
    this.query('form').classList.add('form-horizontal')

    this.addHelpIcon('url')
    this.addHelpIcon('enabled')
  },
  focus () {
    this.query('input[name=url]').focus()
  }
})
