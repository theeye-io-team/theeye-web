import InputView from 'components/input-view'
import './style.css'

export default InputView.extend({
  template: `
    <div>
      <label class="col-sm-3 control-label" data-hook="label"></label>
      <div class="col-sm-9">
        <div class="upload-btn-wrapper">
          <button data-hook="file-input-button" class="btn btn-primary">
            <i class="fa fa-folder-open"></i>
            <span data-hook="file-input-button-label"></span>
          </button>
          <input type="file">
        </div>
        <div data-hook="message-container" class="message message-below message-error">
          <p data-hook="message-text"></p>
        </div>
      </div>
    </div>
  `,
  props: {
    label: [ 'string', true, 'File' ],
    buttonLabel: ['string', true, 'Open File'],
    name: [ 'string', true, 'file' ],
    placeholder: [ 'string', true, 'file' ],
    type: [ 'string', true, 'file' ],
    validClass: [ 'string', true, 'input-valid' ],
    invalidClass: [ 'string', true, 'text-danger' ],
    validityClassSelector: ['string', true, '.control-label'],
    tests: [ 'array', true, () => [] ],
    message: [ 'string', false, '' ],
    unselectedText: 'any', // these are any so a function returning a string can be passed
    value: 'any'  //
  },
  initialize (opts) {
    this.callback = opts.callback || function () {}

    InputView.prototype.initialize.call(this)
  },
  bindings: Object.assign({}, InputView.prototype.bindings, {
    visible: {
      type: 'toggle'
    },
    styles: {
      type: 'attribute',
      name: 'class'
    },
    cid: [
      {
        type: 'attribute',
        name: 'for',
        hook: 'file-input-button'
      },
      {
        type: 'attribute',
        name: 'id',
        selector: 'input'
      }
    ],
    buttonLabel: {
      hook: 'file-input-button-label'
    }
  }),
  beforeSubmit () {
    this.shouldValidate = true
    if (!this.valid) {
      this.message = this.requiredMessage
    }
  },
  reset () {
    this.query('input').value = ''
  },
  disable () {
    let disabledClass = 'input-disabled'

    const hasClass = (element, className) => {
      let regex = new RegExp('(\\s|^)' + className + '(\\s|$)')
      return !!element.className.match(regex)
    }

    if (!hasClass(this.el, disabledClass)) {
      this.el.clasName += disabledClass
      this.query('input').disabled = true
    }
  },
  enable () {
    var regex = new RegExp('(\\s|^)' + 'input-disabled' + '(\\s|$)')

    this.el.className = this.el.className.replace(regex, '')
    this.query('input').disabled = false
  },
  render () {
    var self = this

    InputView.prototype.render.call(this)

    var input = this.query('input')
    input.addEventListener('change', function (changeEvent) {
      var reader = new window.FileReader()
      var file = changeEvent.target.files[0] // file input in single mode, read only 1st item in files array

      reader.onloadend = event => {
        file.contents = event.target.result
        self.callback(file)
        input.value = '' // reset will allow to re import the same file again
      }
      reader.readAsText(file)
    })
  }
})
