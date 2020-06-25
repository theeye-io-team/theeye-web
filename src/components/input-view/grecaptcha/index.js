import App from 'ampersand-app'
import InputView from 'ampersand-input-view'
import loggerModule from 'lib/logger';
const logger = loggerModule('components:input:grecaptcha')

let grecaptcha
try {
  grecaptcha = require('grecaptcha')
} catch (err) {
  logger.warn('grecaptcha disabled. component cannot load required dependency')
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
        sitekey: App.config.grecaptcha.sitekey,
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
