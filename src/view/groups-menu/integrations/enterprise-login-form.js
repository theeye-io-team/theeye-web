import FormView from 'ampersand-form-view'
import IframeParserInputView from './IframeParserInputView'
import CheckboxView from 'components/checkbox-view'

//import isURL from 'validator/lib/isURL'

export default FormView.extend({
  initialize: function (options) {
    this.urlInput = new IframeParserInputView({
      name: 'enterprise_login_url',
      label: 'Enterprise login URL',
      placeholder: 'Enterprise login URL',
      value: this.model.config.enterprise_login.url,
      invalidClass: 'text-danger',
      validityClassSelector: '.control-label',
      required: false,
    })

    this.fields = [
      new CheckboxView({
        name: 'enterprise_login_enabled',
        label: 'Enterprise login enabled',
        value: Boolean(this.model.config.enterprise_login.enabled)
      }),
      this.urlInput
    ]
    FormView.prototype.initialize.apply(this, arguments)
  },
  render () {
    FormView.prototype.render.apply(this, arguments)
    this.query('form').classList.add('form-horizontal')
  },
  focus () {
    this.query('input[name=enterprise_login_url]').focus()
  }
})
