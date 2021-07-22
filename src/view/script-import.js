'use strict'

import App from 'ampersand-app'
import { Model as FileModel } from 'models/file'
import FileForm from 'view/page/files/form'
import Modalizer from 'components/modalizer'
import TaskFormActions from 'actions/taskform'
import InputView from 'components/input-view/index'
import DisabledInputView from 'components/input-view/disabled'

export default DisabledInputView.extend({
  template: `
    <div>
      <label class="col-sm-3 control-label" data-hook="label"></label>
      <div data-hook="input-container" class="col-sm-6">
        <input class="form-control form-input" style="visibility:hidden;display:none;">
        <label class="control-label" data-hook="value-container"></label>
        <div data-hook="message-container" class="message message-below message-error">
          <p data-hook="message-text"></p>
        </div>
      </div>
      <div class="col-sm-3">
        <button data-hook="edit-button" class="btn btn-block btn-primary">Edit script</button>
      </div>
    </div>
  `,
  initialize (options) {
    this.disabled = true
    this.displayValue = options.value
    InputView.prototype.initialize.apply(this, arguments)

    this.listenToAndRun(App.state.taskForm, 'change:file', () => {
      this.displayValue = App.state.taskForm.file.filename
    })
  },
  events: {
    'click button[data-hook=edit-button]': 'onClickEditButton'
  },
  onClickEditButton (event) {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }

    let file
    if (!this.value) {
      file = new FileModel({ _type: 'Script' })
    } else {
      file = new FileModel(App.state.taskForm.file)
    }

    const form = new ImportFileForm({ model: file })
    const modal = new Modalizer({
      buttons: false,
      title: 'Script Form',
      bodyView: form
    })

    this.listenTo(modal, 'shown', () => { form.focus() })
    this.listenTo(modal, 'hidden', () => {
      form.remove()
      modal.remove()
    })

    this.listenTo(form, 'submitted', data => {
      modal.hide()
    })

    modal.show()
    return false
  }
})

const ImportFileForm = FileForm.extend({
  submitCallback () {
    let data = this.prepareData(this.data)
    TaskFormActions.setFile(data)
    this.trigger('submitted', data)
  }
})
