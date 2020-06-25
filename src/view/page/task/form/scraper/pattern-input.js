'use strict'

import View from 'ampersand-view'
import Input from 'ampersand-input-view'

// use a type of parser to process the response.
// by now regular expression pattern parser is allowed
const DEFAULT_PARSER = 'pattern'

const PatternValue = Input.extend({
  template: ` <input data-hook="pattern" class="form-control"> `
})

export default View.extend({
  template: `
    <div class="form-group">
      <label data-hook="label" for="pattern" class="col-sm-3 control-label"></label>
      <div class="col-sm-9">
        <div data-hook="pattern-container" class="input-group">
          <label class="input-group-addon">
            <input data-hook="checkbox" type="checkbox" name="parser" value="pattern">
          </label>
          <div data-hook="input-pattern-container"></div>
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
      selector: 'label[for=pattern]',
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
    visible: ['boolean',false,true],
    label: 'string',
    name: ['string',false,'pattern'],
    pattern_value: ['string',false,''],
    use_parser: ['string',false,null],
    message: 'string',
    showMessage: 'string'
  },
  derived: {
    value: {
      deps: ['pattern_value','use_parser'],
      fn () {
        if (!this.use_parser) return ''
        else return this.pattern_value
      }
    },
    valid: {
      cache: false,
      deps: ['pattern_value'],
      fn: function () {
        if (!this.input) return
        return this.input.valid
      }
    },
  },
  initialize () {
    View.prototype.initialize.apply(this, arguments)

    this.on('change:use_parser',() => {
      if (this.use_parser) {
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
    
    this.on('change:pattern_value',() => {
      if (!this.pattern_value) {
        if (this.use_parser) {
          this.use_parser = null
        }
      } else {
        if (!this.use_parser) {
          this.use_parser = DEFAULT_PARSER
        }
      }
    })

    this.onPatternLoseFocus = this.onPatternLoseFocus.bind(this)
  },
  events: {
    'change input[type=checkbox]': function (event) {
      this.use_parser = (this.checkbox.checked===true? DEFAULT_PARSER : null)
    }
  },
  render () {
    this.renderWithTemplate(this)

    this.checkbox = this.queryByHook('checkbox')
    this.checkbox.checked = Boolean(this.use_parser)
    this.input = this.renderPatternInputView()
  },
  renderPatternInputView () {
    const placeholder = "I.E '<h1>My Site Title</h1>', using RegEx ^[a-zA-Z0-9]{24}$"
    const input = new PatternValue({
      el: this.queryByHook('input-pattern-container'),
      type: 'text',
      name: this.name,
      value: this.pattern_value,
      placeholder: placeholder,
      required: false,
      tests: [
        (value) => {
          try {
            new RegExp(value)
          } catch(e) {
            return e.message
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

    input.input.addEventListener('blur',this.onPatternLoseFocus,false)
    return input
  },
  onPatternLoseFocus (event) {
    if (!this.pattern_value) {
      if (this.use_parser) {
        this.use_parser = null
      }
    }
  },
  /**
   * @summary when this.input value changes it will call this.update method to notify
   */
  update () {
    this.pattern_value = this.input.value
    this.parent.update.apply(this.parent, arguments)
  },
  remove () {
    this.input.input.removeEventListener('blur',this.onPatternLoseFocus,false)
    View.prototype.remove.apply(this, arguments)
  },
  setValue (value) {
    this.input.setValue(value)
  }
})
