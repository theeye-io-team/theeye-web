import assign from 'lodash/assign'
import InputView from 'components/input-view'

module.exports = InputView.extend({
  props: {
    counter: 'number',
    maxlength: 'number'
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
    <div>
      <label data-hook="label" class="col-sm-3 control-label"></label>
      <div class="col-sm-9">
        <span data-hook="counter" style="position: absolute; right: 26px; bottom: 7px; color: #888;"></span>
        <textarea class="form-input form-control" style="height:100px; resize:none;"> </textarea>
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
		this.listenTo(this,'change:inputValue',this.renderCharactersCount)
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
