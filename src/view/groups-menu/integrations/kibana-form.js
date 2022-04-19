import FormView from 'ampersand-form-view'
import IframeParserInputView from './IframeParserInputView'
import CheckboxView from 'components/checkbox-view'

//import isURL from 'validator/lib/isURL'

export default FormView.extend({
  initialize: function (options) {
    this.urlInput = new IframeParserInputView({
      name: 'kibana_url',
      label: 'Kibana URL',
      placeholder: 'Kibana URL',
      value: this.model.config.kibana.url,
      invalidClass: 'text-danger',
      validityClassSelector: '.control-label',
      required: false,
      //tests: [
      //  function (value) {
      //    if (value.length > 0) {
      //      if (!isURL(value, {
      //        protocols: ['http', 'https'],
      //        require_protocol: true
      //      })) {
      //        return 'Must be a valid URL (include protocol)'
      //      }
      //    }
      //  }
      //]
    })

    this.fields = [
      new CheckboxView({
        name: 'kibana_enabled',
        label: 'Kibana enabled',
        value: Boolean(this.model.config.kibana.enabled)
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
    this.query('input[name=kibana_url]').focus()
  }
})
