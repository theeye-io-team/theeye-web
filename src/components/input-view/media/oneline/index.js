import MediaInputView from 'components/input-view/media'
import InputView from 'components/input-view'
import extend from 'lodash/assign'

module.exports = MediaInputView.extend({
  template: `
    <div class="file-input">
      <label data-hook="label" class="col-sm-3 control-label"></label>
      <div class="col-sm-9">
        <div class="input-group">
          <input type="file" style="display:none">
          <input data-hook="selector" class="form-control" type="text" placeholder="Choose file">
          <div class="input-group-addon">
            <a data-hook="remove" href="#">Delete</a> |
            <a data-hook="preview" href="#">Preview</a>
          </div>
        </div>
        <section data-hook="preview-section" class="preview">
          <div class="header">
            <span data-hook="name"></span>
            <span data-hook="preview" class="remove fa fa-remove"></span>
          </div>
          <div data-hook="preview-container"></div>
        </section>
      </div>
    </div>
  `,
  initialize (options) {
    this.file = options.value
    this.readonly = true
    options.value = ""
    InputView.prototype.initialize.apply(this, arguments)
    this.loadInputPreview = this.loadInputPreview.bind(this)
  },
  events: extend({}, MediaInputView.prototype.events, {
    'click [data-hook=preview]': function (event) {
      this.toggle('preview_visible')
    },
    'click input[data-hook=selector]': function (event) {
      this.query('input[type=file]').click()
    }
  }),
  props: {
    preview_visible: ['boolean',false,false],
  },
  bindings: extend({}, MediaInputView.prototype.bindings, {
    preview_visible: {
      type: 'toggle',
      hook: 'preview-section'
    },
    'file.name': [
      { type:'text', hook:'name' },
      { type:'toggle', hook:'name' },
      { type:'toggle', hook:'remove' },
      { type:'toggle', hook:'preview' },
      {
        type: 'attribute',
        hook: 'selector',
        name: 'value'
      }
    ]
  })
})
