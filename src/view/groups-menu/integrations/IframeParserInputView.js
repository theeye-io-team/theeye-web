import InputView from 'components/input-view'

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

export default IframeParserInputView
