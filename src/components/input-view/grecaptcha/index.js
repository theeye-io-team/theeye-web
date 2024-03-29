import App from 'ampersand-app'
import config from 'config'
import InputView from 'ampersand-input-view'
import loggerModule from 'lib/logger';
const logger = loggerModule('components:input:grecaptcha')

let grecaptcha
try {
  if (
    App.config.components.grecaptcha.enabled === false ||
    App.config.components.grecaptcha.disabled === true
  ) {
    throw new Error('grecaptcha disabled by config.')
  }
  grecaptcha = require('grecaptcha')
} catch (err) {
  logger.warn('grecaptcha disabled. cannot load required dependency')
}

const RecaptchaInputView = InputView.extend({
  template: `
    <div style="text-align:center">
      <div data-hook="input-container" style="display:inline-flex">
      </div>
      <input type='hidden'>
    </div>
  `,
  //initialize () {
  //  InputView.prototype.initialize.apply(this, arguments)
  //},
  props: {
    value: ['string', false],
    name: ['string', false, 'grecaptcha'],
    type: ['string', false, 'hidden'],
    widget_id: ['number', false]
  },
  bindings: {},
  derived: {
    valid: {
      deps: ['value'],
      fn () {
        if (!grecaptcha) return true
        return (this.value !== undefined)
      }
    }
  },
  render () {
    InputView.prototype.render.apply(this, arguments)
    
    if (!grecaptcha) {
      logger.warn('grecaptcha disabled. component cannot load required dependency')
      return
    }

    let widget_id = grecaptcha.render(
      this.query('[data-hook=input-container]'),
      {
        sitekey: App.config.components.grecaptcha.sitekey,
        callback: () => {
          this.value = grecaptcha.getResponse(widget_id)
        },
        'expired-callback': () => {
          this.value = undefined
        },
        'error-callback': () => {
          this.value = undefined
        }
      }
    )
  }
})

export default RecaptchaInputView
