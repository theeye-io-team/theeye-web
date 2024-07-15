import InputView from 'components/input-view'

//const input = new SimpleInputView({
//  name: 'value',
//  value: this.model.value,
//  placeholder: 'Value',
//  invalidClass: 'text-danger',
//  validityClassSelector: 'p[data-hook=message-text]',
//  required: true
//})

const SimpleInputView = InputView.extend({
  template: `
    <div style="margin:0;">
      <input class="form-control form-input">
      <div data-hook="message-container" class="message message-below message-error">
        <p data-hook="message-text"></p>
      </div>
    </div>
  `
})

export default SimpleInputView
