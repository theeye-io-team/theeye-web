import App from 'ampersand-app'
import InputView from 'components/input-view'

import './styles.less'

export default InputView.extend({
  props: {
    contentType: ['string', 'false', 'text'],
    height: ['number',false, 100],
    counter: 'number',
    maxlength: 'number',
    prettyJson: ['boolean', false, false]
  },
  setValue (value) {
    const setValue = InputView.prototype.setValue
    if (this.contentType === 'json' || this.prettyJson === true) {
      if (typeof value === 'object') {
        let json
        try {
          json = JSON.stringify(value, undefined, (this.prettyJson?2:null))
        } catch (err) {
          console.error(err)
          json = String(value)
        }
        return setValue.call(this, json)
      }
    }

    setValue.call(this, value)
  },
  derived: {
    value: {
      deps: ['inputValue'],
      fn () {
        if (this.prettyJson === true) {
          try {
            return JSON.stringify(JSON.parse(this.inputValue))
          } catch (err) {
            return this.inputValue
          }
        } else {
          return this.inputValue
        }
      }
    }
  },
  bindings: Object.assign({}, InputView.prototype.bindings, {
    counter: { hook: 'counter' },
    maxlength: {
      selector: 'textarea',
      type: 'attribute',
      name: 'maxlength'
    }
  }),
  template () {
    return `
      <div data-component="theeye-textarea">
        <label data-hook="label" class="col-sm-3 control-label"></label>
        <div class="col-sm-9">
          <span data-hook="counter" class="textarea-counter"></span>
          <textarea style="height: ${this.height}px;" class="form-input form-control"> </textarea>
          <div data-hook="message-container" class="message message-below message-error">
            <p data-hook="message-text"></p>
          </div>
        </div>
      </div>
    `
  },
	initialize () {
    this.type = 'textarea'
		InputView.prototype.initialize.apply(this, arguments)

		// listen for changes to input value
		this.listenTo(this, 'change:inputValue', this.renderCharactersCount)
	},
  render () {
		InputView.prototype.render.apply(this, arguments)

    this.el
      .querySelector('textarea')
      .addEventListener('blur', this.onTextareaLeave.bind(this), false)

    this.onTextareaLeave()
  },
  onTextareaLeave () {
    if (this.prettyJson === true) {
      try {
        let value = JSON.parse(this.input.value)
        this.input.value = JSON.stringify(value,undefined,2)
      } catch (e) {
      }
    }
  },
  renderCharactersCount () {
    if (this.timeout) window.clearTimeout(this.timeout)
    this.counter = this.inputValue.length
    const $counterElem = $(this.queryByHook('counter'))
    $counterElem.show()
    this.timeout = window.setTimeout(() => {
      $counterElem.hide('slow')
    },2000)

    if (this.maxlength && this.counter === this.maxlength) {
      App.state.alerts.warning(`${this.label} allowed ${this.maxlength} characters length`)
      $counterElem.css('color','red')
    } else {
      $counterElem.css('color','#888')
    }
  }
})
