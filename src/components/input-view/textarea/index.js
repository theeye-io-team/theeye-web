import assign from 'lodash/assign'
import InputView from 'components/input-view'

import './styles.less'

module.exports = InputView.extend({
  props: {
    counter: 'number',
    maxlength: 'number',
    prettyJson: ['boolean', false, false]
  },
  bindings: assign({}, InputView.prototype.bindings, {
    counter: { hook: 'counter' },
    maxlength: {
      selector: 'textarea',
      type: 'attribute',
      name: 'maxlength'
    }
  }),
  template: `
    <div data-component="theeye-textarea">
      <label data-hook="label" class="col-sm-3 control-label"></label>
      <div class="col-sm-9">
        <span data-hook="counter" class="textarea-counter"></span>
        <textarea class="form-input form-control"> </textarea>
        <div data-hook="message-container" class="message message-below message-error">
          <p data-hook="message-text"></p>
        </div>
      </div>
    </div>
  `,
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
      $counterElem.css('color','red')
    } else {
      $counterElem.css('color','#888')
    }
  }
})
