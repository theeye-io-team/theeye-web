import SelectView from 'components/select2-view'
import HostGroupActions from 'actions/hostgroup'
import ConfigsView from '../../configs'
import FileInputView from 'components/input-view/file'
import bootbox from 'bootbox'

export default SelectView.extend({
  template: `
    <div class="form-group form-horizontal hostconfig-select">
      <label data-hook="label" class="col-sm-3 control-label"></label>
      <div class="col-sm-6">
        <select class="form-control select" style="width:100%"></select>
        <div data-hook="message-container" class="message message-below message-error">
          <p data-hook="message-text"></p>
        </div>
      </div>
        <div class="col-sm-3" data-hook="import-file-container"></div>
        <section class="col-sm-12" data-hook="configs-container"> </section>
    </div>
  `,
  derived: {
    has_config: {
      deps: ['inputValue'],
      fn () {
        return Boolean(this.inputValue)
      }
    }
  },
  bindings: Object.assign({}, SelectView.prototype.bindings, {
    has_config: {
      type: 'toggle',
      hook: 'configs-container'
    }
  }),
  initialize () {
    SelectView.prototype.initialize.apply(this, arguments)

    this.on('change:value', () => {
      if (this.value) {
        HostGroupActions.fetchHostConfig(this.value)
      }
    }, this)
  },
  render () {
    SelectView.prototype.render.apply(this, arguments)

    var importFileInput = new ImportFileInputView({
      callback: (file) => {
        if (file && /json\/*/.test(file.type) === true && file.contents && file.contents.length) {
          try {
            var recipe = JSON.parse(file.contents)

            HostGroupActions.readRecipeConfig(recipe)
          } catch (e) {
            bootbox.alert('Invalid JSON file.')
          }
        } else {
          bootbox.alert('File not supported, please select a JSON file.')
        }
        this.reset()
      }
    })

    this.renderSubview(
      new ConfigsView({ edit_mode: true }),
      this.queryByHook('configs-container')
    )

    this.renderSubview(
      importFileInput,
      this.queryByHook('import-file-container')
    )
  },
  update () {
    this.clear()
  }
})

const ImportFileInputView = FileInputView.extend({
  template: `
    <div>
      <div class="col-sm-12">
        <div class="upload-btn-wrapper" style="display:block">
          <button for="file-upload" data-hook="button-label" class="btn btn-primary" style="width:100%">
            <i class="fa fa-upload"></i> Import
          </button>
          <input id="file-upload" class="" type="file">
        </div>
      </div>
    </div>
  `
})
