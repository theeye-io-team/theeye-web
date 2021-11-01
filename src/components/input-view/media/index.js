import View from 'ampersand-view'
import InputView from 'components/input-view'
import bootbox from 'bootbox'

export default InputView.extend({
  props: {
    file: 'state',
    maxImageWidth: 'number',
    maxImageHeight: 'number',
    maxFileSize: 'number'
  },
  template: `
    <div>
      <input style="display:none;" type="file">
      <div data-hook="preview" class="file">
        <div class="header">
          <span data-hook="name"></span>
          <span data-hook="remove" class="remove fa fa-remove"></span>
        </div>
        <div data-hook="preview-container"></div>
      </div>
    </div>
  `,
  events: {
    'click [data-hook=remove]':'clearInput',
    'click [data-hook=preview-container]':'onClickPreview'
  },
  bindings: Object.assign({}, InputView.prototype.bindings, {
    'file.name': [
      { type:'text', hook:'name' },
      { type:'toggle', hook:'name' },
      { type:'toggle', hook:'remove' }
    ]
  }),
  initialize (options) {
    this.styles += ' item col-sm-2'
    this.type = 'file'
    this.file = options.value
    options.value = ""
    InputView.prototype.initialize.apply(this, arguments)
    this.loadInputPreview = this.loadInputPreview.bind(this)
  },
  render () {
    InputView.prototype.render.apply(this)
    this.input.addEventListener('change', this.loadInputPreview, false)
    this.listenTo(this.file, 'destroy', this.onFileDestroyed)
    this.preview = new FilePreview({ file: this.file })
    this.renderSubview(this.preview, this.queryByHook('preview-container'))
  },
  onFileDestroyed (event) {
    console.log(' file destroyed ')
    this.file.clear()
  },
  onClickPreview () {
    $(this.input).trigger('click')
  },
  onFileChange () {
    console.log('file changed');
    console.log(this.file)
  },
  clearInput () {
    this.file.name = undefined
    this.file.type = undefined
    this.file.dataUrl = undefined
    this.input.value = ''
  },
  /**
   *
   * Load an image, validate size and dimension and generate preview
   *
   */
  _loadFile (file) {
    const self = this

    let allowPreview = /image\/(?:png|jpeg|webp|gif|bmp|ico)/.test(file.type)

    if (this.maxFileSize && (file.size / 1024) > this.maxFileSize) {
      bootbox.alert(`La imagen no puede superar los ${this.maxFileSize} Kb`)
      this.clearInput()
      return
    }

    var reader = new FileReader()
    reader.onload = function (e) {
      const result = e.target.result

      if (allowPreview === true) {
        var image = new Image()
        image.onload = function () {
          self.inputValue = file
        }

        image.src = result
      } else {
        self.inputValue = file
      }

      self.file.dataUrl = result
      self.file.type = file.type
      self.file.name = file.name
    }
    reader.readAsDataURL(file)
  },
  loadInputPreview () {
    // only images allowed so far (but video also works if required)
    const input = this.input
    if (input.files && input.files[0]) {
      var file = input.files[0]
      this._loadFile(file)
    }
  },
  remove () {
    InputView.prototype.remove.apply(this)
    this.input.removeEventListener('change', this.loadInputPreview, false);
  },
  beforeSubmit () {
    return
  }
})

const FilePreview = View.extend({
  props: {
    file: 'state'
  },
  template: `<div class="file-preview"></div>`,
  initialize () {
    View.prototype.initialize.apply(this,arguments)
    this.listenTo(this.file,'change',() => {
      this.render()
    })
  },
  render () {
    this.renderWithTemplate(this)

    if (/image/.test(this.file.type) === true) {
      this.preview = new ImagePreview({ model: this.file })
    }
    if (/video/.test(this.file.type) === true) {
      this.preview = new VideoPreview({ model: this.file })
    }

    if (!this.preview) return
    this.renderSubview(this.preview, this.el)
  }
})

const ImagePreview = View.extend({
  template: `<img>`,
  bindings: {
    'model.dataUrl': {
      selector: 'img',
      type: 'attribute',
      name: 'src'
    },
  },
})

const VideoPreview = View.extend({
  template: `
    <video controls>
      <source src="" type="">
    </video>
  `,
  bindings: {
    'model.uri': {
      selector: 'source',
      type: 'attribute',
      name: 'src'
    },
    'model.type': {
      selector: 'source',
      type: 'attribute',
      name: 'type'
    },
  },
})
