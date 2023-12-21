
import App from 'ampersand-app'
import { Model as FileModel } from 'models/file'
import FileForm from 'view/page/files/form'
import Modalizer from 'components/modalizer'
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
  props: {
    file: 'object'
  },
  initialize (options) {
    this.disabled = true
    this.displayValue = options.file.filename
    options.value = this.displayValue
    InputView.prototype.initialize.apply(this, arguments)
    this.listenTo(this, 'change:file', () => {
      this.displayValue = this.file.filename
      this.inputValue = this.file.filename
    })
  },
  events: {
    'click button[data-hook=edit-button]': 'onClickEditButton'
  },
  selected () {
    return this.file
  },
  onClickEditButton (event) {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }

    let fileModel
    if (!this.file) {
      fileModel = new FileModel({ _type: 'Script' })
    } else {
      fileModel = new FileModel(this.file, { parse: true })
      //file = new FileModel( App.state.taskForm.file )
    }

    const form = new FileForm({
      model: fileModel,
      onsubmit: (data) => {
        this.file = data
        modal.hide()
      }
    })

    const modal = new Modalizer({
      buttons: false,
      title: 'Script Form',
      bodyView: form
    })

    this.listenTo(modal, 'shown', () => {
      form.focus()
    })

    this.listenTo(modal, 'hidden', () => {
      form.remove()
      modal.remove()
    })

    modal.show()
    return false
  }
})
