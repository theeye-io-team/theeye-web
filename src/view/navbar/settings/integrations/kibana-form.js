import FormView from 'ampersand-form-view'
import InputView from 'components/input-view'
import isURL from 'validator/lib/isURL'

const IframeParserInputView = InputView.extend({
  clean (value) {
    let originalValue = InputView.prototype.clean.apply(this, arguments)
    return this.parseIframe(originalValue)
  },
  parseIframe (value) {
    if (!value) return value
    if (!value.match) return value
    if (!value.match('iframe')) return value

    let parsed = null
    try {
      let div = document.createElement('div')
      div.innerHTML = value.trim()
      parsed = div.firstChild

      if (parsed.tagName === 'IFRAME') {
        this.setValue(parsed.src, true)
        return parsed.src
      } else {
        return value
      }
    } catch (err) {
      return value
    }
  }
})

module.exports = FormView.extend({
  initialize: function (options) {
    this.urlInput = new IframeParserInputView({
      name: 'kibana',
      label: 'Kibana URL',
      placeholder: 'Kibana URL',
      value: this.model.config.kibana,
      invalidClass: 'text-danger',
      validityClassSelector: '.control-label',
      required: false,
      tests: [
        function (value) {
          if (value.length > 0) {
            if (!isURL(value, {
              protocols: ['http', 'https'],
              require_protocol: true
            })) {
              return 'Must be a valid URL (include protocol)'
            }
          }
        }
      ]
    })

    this.fields = [ this.urlInput ]
    FormView.prototype.initialize.apply(this, arguments)
  },
  render () {
    FormView.prototype.render.apply(this, arguments)
    this.query('form').classList.add('form-horizontal')
  },
  focus () {
    this.query('input[name=kibana]').focus()
  }
})
