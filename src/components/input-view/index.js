
import InputView from 'ampersand-input-view'
import './styles.less'
/**
 *
 * This is a custom template InputView
 * that use <div> instead of <label>
 *
 */
export default InputView.extend({
  template: `
    <div>
      <div>
        <div data-hook="picker" class="col-sm-3 col-sm-offset-3">
          <button class="btn btn-default"></button>
        </div>
      </div>
      <div data-hook="pickable">
        <label class="col-sm-3 control-label" data-hook="label"></label>
        <div data-hook="input-container" class="col-sm-9">
          <input class="form-control form-input">
          <span data-hook="mask-toggle" class="fa form-control-feedback"></span>
          <div data-hook="message-container" class="message message-below message-error">
            <p data-hook="message-text"></p>
          </div>
        </div>
      </div>
    </div>
  `,
  props: {
    pickerText: ['string', false, 'pick one'],
    pickable: ['boolean', false, false],
    visible: ['boolean',false,true],
    styles: ['string',false,'form-group'],
    maskToggle: ['boolean',false,true],
    disabled: ['boolean',false,false],
    readonly: ['boolean',false,false],
  },
  bindings: Object.assign({}, InputView.prototype.bindings, {
    pickerText: { selector: '[data-hook=picker] button' },
    pickable: [
      {
        hook: 'picker',
        type: 'toggle'
      },
      {
        hook: 'pickable',
        type: 'toggle',
        invert: true
      }
    ],
    visible: {
      type: 'toggle'
    },
    styles: {
      type: 'attribute',
      name: 'class'
    },
    showMaskToggle: {
      hook: 'mask-toggle',
      type: 'toggle'
    },
    maskToggle: {
      type: 'booleanClass',
      hook: 'mask-toggle',
      yes: 'fa-eye-slash',
      no: 'fa-eye'
    },
    disabled: [{
      type: 'booleanAttribute',
      name: 'disabled',
      selector: 'input'
    },{
      type: 'booleanClass',
      selector: 'input',
      yes: 'disabled-appearance'
    }],
    readonly: {
      type: 'booleanAttribute',
      name: 'readonly',
      selector: 'input'
    }
  }),
  events: {
    'click [data-hook=mask-toggle]':'onclickMaskToggle',
    'click [data-hook=picker] button':'onclickPickerButton',
  },
  onclickPickerButton (event) {
    event.preventDefault()
    event.stopPropagation()
    this.toggle('pickable')
  },
  onclickMaskToggle (event) {
    event.preventDefault()
    event.stopPropagation()
    this.toggle('maskToggle')
    if (this.type === 'password') {
      this.type = 'input'
    } else {
      this.type = 'password'
    }
  },
  initialize (options) {
    if (options && options.type) {
      this.showMaskToggle = (options.type === 'password')
    }

    InputView.prototype.initialize.apply(this, arguments)
  },
  render () {
    InputView.prototype.render.apply(this, arguments)

    this.input.addEventListener('focusout', () => {
      this.trigger('focusout', this)
    })
  },
  setValue (value) {
    InputView.prototype.setValue.call(this, String(value))
  }
})
