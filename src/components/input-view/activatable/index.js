
import View from 'ampersand-view'
import Input from 'ampersand-input-view'

export default View.extend({
  template: `
    <div class="form-group">
      <label data-hook="label" for="checkbox" class="col-sm-3 control-label"></label>
      <div class="col-sm-9">
        <div class="input-group">
          <label class="input-group-addon">
            <input data-hook="checkbox" type="checkbox" name="checkbox" value="checkbox">
          </label>
          <div data-hook="text-input-container"></div>
        </div>
        <div data-hook="message-container" class="message message-below message-error">
          <p data-hook="message-text"></p>
        </div>
      </div>
    </div>
  `,
  bindings: {
    visible: { type: 'toggle' },
    showMessage: [{
      type: 'toggle',
      hook: 'message-container'
    },{
      type: 'booleanClass',
      selector: 'label[for=checkbox]',
      name: 'text-danger'
    }],
    message: {
      hook: 'message-text'
    },
    label: {
      hook: 'label'
    }
  },
  props: {
    placeholder: ['string', true, 'Leave it empty to disable'],
    visible: ['boolean',false,true],
    label: 'string',
    name: ['string',false,'conditional'],
    input_value: ['string',false,''],
    activated: ['boolean',false,false],
    message: 'string',
    showMessage: 'string',
    required: ['boolean', false, true]
  },
  derived: {
    value: {
      deps: ['input_value','activated'],
      fn () {
        if (this.activated === false) { return '' }
        else { return this.input_value }
      }
    },
    valid: {
      cache: false,
      deps: ['input_value'],
      fn () {
        if (!this.input) {
          return
        }

        return this.input.shouldValidate = true
      }
    }
  },
  initialize (options) {
    View.prototype.initialize.apply(this, arguments)

    if (options.value) {
      this.input_value = options.value
      this.activated = true
    }

    this.on('change:activated',() => {
      if (this.activated === true) {
        if (this.input.el !== document.activeElement) {
          this.input.el.focus()
        }
        if (!this.checkbox.checked) {
          this.checkbox.checked = true
        }
      } else {
        if (this.input.value) {
          this.input.setValue('')
        }
        if (this.checkbox.checked) {
          this.checkbox.checked = false
        }
      }
    })
    
    this.on('change:input_value',() => {
      if (!this.input_value) {
        if (this.activated) {
          this.activated = false
        }
      } else {
        if (this.activated === false) {
          this.activated = true
        }
      }
    })

    this.onTextInputLoseFocus = this.onTextInputLoseFocus.bind(this)
  },
  events: {
    'change input[type=checkbox]': function (event) {
      this.activated = Boolean(this.checkbox.checked === true)
    }
  },
  render () {
    this.renderWithTemplate(this)

    this.checkbox = this.queryByHook('checkbox')
    this.checkbox.checked = this.activated
    this.input = this.renderInputView()
    this.input.on('change:valid change:value', this.reportToParent, this);
  },
  renderInputView () {
    const input = new InputValue({
      el: this.queryByHook('text-input-container'),
      type: 'text',
      name: this.name,
      value: this.input_value,
      placeholder: this.placeholder,
      required: false,
      tests: [
        (value) => {
          if (this.required) {
            if (!value) { return 'Cannot leave it empty' }
          }
        }
      ]
    })

    input.render()
    this.registerSubview(input)

    this.listenTo(input,'change:message',() => {
      this.message = input.message
    })
    this.listenTo(input,'change:showMessage',() => {
      this.showMessage = input.showMessage
    })

    input.input.addEventListener('blur',this.onTextInputLoseFocus,false)
    return input
  },
  onTextInputLoseFocus (event) {
    if (!this.input_value) {
      if (this.activated) {
        this.activated = false
      }
    }
  },
  /**
   * @summary when this.input value changes it will call this.update method to notify
   */
  update () {
    this.input_value = this.input.value
    this.parent.update.apply(this.parent, arguments)
  },
  remove () {
    this.input.input.removeEventListener('blur',this.onTextInputLoseFocus,false)
    View.prototype.remove.apply(this, arguments)
  },
  setValue (value) {
    this.input.setValue(value)
  }
})

const InputValue = Input.extend({
  template: `<input data-hook="input-value" class="form-control">`
})
