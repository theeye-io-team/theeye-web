
import View from 'ampersand-view'
import InputView from 'components/input-view'

const PathInput = InputView.extend({
  template: `<input data-hook="path" class="form-input">`
})

export default View.extend({
  template: `
    <div class="form-group">
      <label data-hook="label" for="path_input" class="col-sm-3 control-label"></label>
      <div class="col-sm-9">
        <div class="input-group">
          <div data-hook="input-path-container"></div>
          <label class="input-group-addon">
            <span data-hook="checkbox_label"></span>
            <input data-hook="checkbox" type="checkbox" name="is_manual_path">
          </label>
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
      selector: 'label[for=path]',
      name: 'text-danger'
    }],
    message: { hook: 'message-text' },
    label: { hook: 'label' },
    checkbox_label: { hook: 'checkbox_label' }
  },
  props: {
    visible: ['boolean',false,true],
    label: ['string',false,'Path *'],
    checkbox_label: ['string',false,'Custom Filename'],
    name: ['string',false,'path_input'],
    path: 'string',
    is_manual_path: 'boolean',
    message: 'string',
    showMessage: 'string'
  },
  derived: {
    value: {
      deps: ['path','is_manual_path'],
      fn () {
        let { is_manual_path, path } = this
        return { is_manual_path, path }
      }
    },
    valid: {
      cache: false,
      deps: ['path'],
      fn () {
        if (!this.input) { return false }
        return this.input.valid
      }
    },
  },
  events: {
    'change input[type=checkbox]': function (event) {
      this.is_manual_path = this.checkbox.checked
    }
  },
  render () {
    this.renderWithTemplate(this)

    this.checkbox = this.queryByHook('checkbox')
    this.listenToAndRun(this, 'change:is_manual_path', () => {
      this.checkbox.checked = Boolean(this.is_manual_path)
    })

    this.input = this.renderPathInputView()
  },
  renderPathInputView () {
    let input = new PathInput({
      label: 'Path *',
      name: 'path',
      placeholder: '/etc/theeye',
      styles: 'form-control',
      required: false,
      invalidClass: 'text-danger',
      validityClassSelector: '.control-label',
      value: this.path
    })

    input.render()
    this.renderSubview(input, this.queryByHook('input-path-container'))

    this.listenTo(input,'change:message',() => {
      this.message = input.message
    })
    this.listenTo(input,'change:showMessage',() => {
      this.showMessage = input.showMessage
    })

    return input
  },
  /**
   * @summary when this.input value changes it will call this.update method to notify
   */
  update () {
    this.path = this.input.value
    this.parent.update.apply(this.parent, arguments)
  },
  setValue (opts) {
    this.is_manual_path = opts.is_manual_path
    this.input.setValue(opts.path)
  }
})
