import assign from 'lodash/assign'
import FormView from 'ampersand-form-view'
import View from 'ampersand-view'
import FileActions from 'actions/file'
import InputView from 'components/input-view'
import TextareaView from 'components/input-view/textarea'
import HelpIcon from 'components/help-icon'
import FormButtons from 'components/form/buttons'
// const FileModeConst = require('constants/file-input-mode')
import FileInputView from 'components/input-view/file'

import { EditorView } from './editor'

const HelpTexts = require('language/help')

const IntroView = View.extend({
  template: `<p class="bg-info" style="padding: 8px;">
    <span class="label label-success">New</span>&nbsp;
    Use the editor to type/paste your script, or just drag n'drop a file
    <strong>into</strong> the editor. Code highlighting
    is set when you name your script with extension.
  </p>`
})
module.exports = FormView.extend({
  initialize (options) {
    // needed for codemirror listener
    this.onEditorDrop = this.onEditorDrop.bind(this)

    this.filenameInput = new InputView({
      label: 'Filename *',
      name: 'filename',
      required: true,
      invalidClass: 'text-danger',
      validityClassSelector: '.control-label',
      value: this.model.filename,
      tests: [
        value => {
          if (value && !this.model.extension) {
            return 'Filename needs an extension'
          }
          // hack: when setting before render this.editorView is undef
          //if (this.editorView && !this.editorView.validMode) {
          //  return 'You need to use a valid (recognizable) file extension'
          //}
        }
      ]
    })

    this.fields = [
      this.filenameInput,
      new TextareaView({
        label: 'More Info',
        name: 'description',
        required: false,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: this.model.description
      }),
      new FileInputView({
        label: 'In case you\'re lazy...',
        callback: (file) => {
          // data has it's own listener
          this.model.data = file.contents
          // the filename input view needs to use its setter
          this.filenameInput.setValue(file.name)
        }
      })
    ]
    this.listenTo(this.filenameInput, 'change:value', this.onFilenameChange)
    FormView.prototype.initialize.apply(this, arguments)
  },
  onFilenameChange (state, value) {
    // update model.extension
    const extension = value.lastIndexOf('.') > -1
      ? value.substr(value.lastIndexOf('.') + 1)
      : ''

    this.model.extension = extension
  },
  focus () {
    this.query('input').focus()
  },
  render () {
    FormView.prototype.render.apply(this, arguments)
    this.query('form').classList.add('form-horizontal')

    this.addHelpIcon('name')

    // new editor and modal behavior info, added 1/12/17
    // remove when everybody knows how to use it?
    let intro = new IntroView()
    intro.render()
    this.el.prepend(intro.el)

    this.editorView = new EditorView({file: this.model})
    this.renderSubview(this.editorView)

    this.editorView.codemirror.on('drop', this.onEditorDrop)

    const buttons = this.buttons = new FormButtons()
    this.renderSubview(buttons)
    buttons.on('click:confirm', () => { this.submit() })
  },
  onEditorDrop (instance, event) {
    const dt = event.dataTransfer
    if (dt.files.length === 1) {
      this.filenameInput.setValue(dt.files[0].name)
    }
  },
  addHelpIcon (field) {
    const view = this._fieldViews[field]
    if (!view) return
    view.renderSubview(
      new HelpIcon({
        text: HelpTexts.task.form[field]
      }),
      view.query('label')
    )
  },
  remove () {
    FormView.prototype.remove.apply(this)
  },
  submit () {
    this.beforeSubmit()
    if (!this.valid) return

    let data = this.prepareData(this.data)
    if (!this.model.isNew()) {
      FileActions.update(this.model.id, data)
    } else {
      FileActions.create(data)
    }

    this.trigger('submit')
  },
  prepareData (data) {
    let f = assign(
      {},
      // most of the data is being directly written to model
      this.model._values,
      data,
      // fixed values
      {
        data: this.editorView.codemirror.getValue(),
        _type: 'script'
      }
    )
    return f
  },
  setWithData (data) {
    this.setValues({
      /** select which data we need to set **/
    })
  }
})
