
import InputView from '../index'
import assign from 'lodash/assign'

export default InputView.extend({
  template: `
    <div>
      <label class="col-sm-3 control-label" data-hook="label"></label>
      <div data-hook="input-container" class="col-sm-9">
        <input class="form-control form-input" style="visibility:hidden;display:none;">
        <label class="control-label" data-hook="value-container"></label>
        <div data-hook="message-container" class="message message-below message-error">
          <p data-hook="message-text"></p>
        </div>
      </div>
    </div>
  `,
  props: {
    displayValue: 'string'
  },
  bindings: assign({}, InputView.prototype.bindings, {
    displayValue: {
      hook: 'value-container'
    }
  }),
  initialize (options) {
    this.disabled = true
    this.displayValue = options.value
    InputView.prototype.initialize.apply(this,arguments)
  }
})
