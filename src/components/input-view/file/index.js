import InputView from 'components/input-view'
import './style.css'

// //////////////////////////////////////////////////////////////////////////////

var FileReaderInputView = InputView.extend({
  props: {
    label: [ 'string', true, 'File' ],
    name: [ 'string', true, 'file' ],
    placeholder: [ 'string', true, 'file' ],
    type: [ 'string', true, 'file' ],
    validClass: [ 'string', true, 'input-valid' ],
    invalidClass: [ 'string', true, 'text-danger' ],
    validityClassSelector: ['string', true, '.control-label'],
    tests: [ 'array', true, () => [] ],
    message: [ 'string', false, '' ],
    template: [ 'any', false, '' ],
    unselectedText: 'any', // these are any so a function returning a string can be passed
    value: 'any'  //
  },
  initialize: function (opts) {
    this.callback = opts.callback || function () {}

    if (typeof opts.template === 'undefined') {
      this.template = `
        <div>
          <label class="col-sm-3 control-label" data-hook="label"></label>
          <div class="col-sm-9">
            <div class="upload-btn-wrapper">
              <button for="file-upload" data-hook="button-label" class="btn btn-primary">
                <i class="fa fa-folder-open"></i> Open File
              </button>
              <input id="file-upload" class="" type="file">
            </div>
            <div data-hook="message-container" class="message message-below message-error">
              <p data-hook="message-text"></p>
            </div>
          </div>
        </div>
      `
    }

    //
    // this.requiredMet = this.fieldsValid = true;

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
        hook: 'button-label'
      },
      {
        type: 'attribute',
        name: 'id',
        selector: 'input'
      }
    ]
  }),
  beforeSubmit: function () {
    this.shouldValidate = true
    if (!this.valid) { // && !this.requiredMet) {
      this.message = this.requiredMessage
    }
  },
  reset: function () {
    this.query('input').value = ''
  },
  disable: function () {
    var disabledClass = 'input-disabled'
    function hasClass (element, className) {
      var regex = new RegExp('(\\s|^)' + className + '(\\s|$)')
      return !!element.className.match(regex)
    }

    if (!hasClass(this.el, disabledClass)) {
      this.el.clasName += disabledClass
      this.query('input').disabled = true
    }
  },
  enable: function () {
    var regex = new RegExp('(\\s|^)' + 'input-disabled' + '(\\s|$)')

    this.el.className = this.el.className.replace(regex, '')
    this.query('input').disabled = false
  },
  render: function () {
    var self = this

    InputView.prototype.render.call(this)

    this.query('input').addEventListener('change', function (changeEvent) {
      var reader = new window.FileReader()
      var file = changeEvent.target.files[0] // file input in single mode, read only 1st item in files array

      reader.onloadend = event => {
        file.contents = event.target.result
        self.callback(file)
      }
      reader.readAsText(file)
    })
  }
})

module.exports = FileReaderInputView
