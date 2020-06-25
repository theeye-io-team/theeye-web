'use strict'

import App from 'ampersand-app'
import SelectView from 'components/select2-view'
import FileForm from 'view/page/files/form'
import Modalizer from 'components/modalizer'
import { Model as FileModel } from 'models/file'

export default SelectView.extend({
  template: `
    <div>
      <div>
        <label data-hook="label" class="col-sm-3 control-label"></label>
        <div class="col-sm-6">
          <select class="form-control select" style="width:100%"></select>
          <div data-hook="message-container" class="message message-below message-error">
            <p data-hook="message-text"></p>
          </div>
        </div>
      </div>
      <div class="col-sm-3">
        <button data-hook="mode-button" class="btn btn-block btn-primary"></button>
      </div>
    </div>
  `,
  initialize (options) {
    this.options = App.state.files
    this.multiple = false
    this.tags = false
    this.label = options.label || 'Files'
    this.name = 'file'
    this.styles = 'form-group'
    this.idAttribute = 'id'
    this.textAttribute = 'summary'
    this.allowCreateTags = false
    this.allowClear = true
    this.unselectedText = 'select a file'
    this.requiredMessage = 'Selection required'
    this.invalidClass = 'text-danger'
    this.validityClassSelector = '.control-label'

    SelectView.prototype.initialize.apply(this, arguments)
  },
  render () {
    SelectView.prototype.render.apply(this,arguments)

    this.listenToAndRun(this,'change:value', () => {
      let btnTxt = (!this.value) ? 'Create File' : 'Update File'
      this.queryByHook('mode-button').innerHTML = btnTxt
    })
  },
  events: {
    'click button[data-hook=mode-button]':'onClickModeButton'
  },
  onClickModeButton (event) {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }

    let file
    if (!this.value) {
      file = new FileModel()
    } else {
      file = App.state.files.get(this.value)
      App.actions.file.get(this.value)
    }

    const form = new FileForm({ model: file })
    const modal = new Modalizer({
      buttons: false,
      title: 'File Form',
      bodyView: form
    })

    this.listenTo(modal,'shown',() => { form.focus() })
    this.listenTo(modal,'hidden',() => {
      form.remove()
      modal.remove()
    })

    this.listenTo(form, 'submitted', file => {
      // wait until file change/set id to use as selected
      this.listenToAndRun(file,'change:id',() => {
        if (!file.id) { return }
        // if edit/create script, the id should be set
        // then re-render select2 component
        this.renderSelect2Component(file.id)
        modal.hide()
      })
    })

    modal.show()
    return false
  }
})
