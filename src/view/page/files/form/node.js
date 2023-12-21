import App from 'ampersand-app'
import FormView from 'ampersand-form-view'
import InputView from 'components/input-view'
import TextareaView from 'components/input-view/textarea'
import FormButtons from 'components/form/buttons'
import FileInputView from 'components/input-view/file'
import CommonButton from 'components/common-button'
import MembersSelectView from 'view/members-select'
import { EditorView } from './editor'
import ScriptOnBoarding from '../scriptOnboarding'
import HelpIcon from 'components/help-icon'
import HelpTexts from 'language/help'
import RandomTipView from './random-tip'
import bootbox from 'bootbox'

const Boilerplate = `
module.exports = async (args) => {

  return {}

}
`

export default FormView.extend({
  initialize (options) {
    // needed for codemirror listener
    this.onEditorDrop = this.onEditorDrop.bind(this)
    this.filenameInput = new FilenameInputView({
      value: this.model.filename
    })

    // force check
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
      new MembersSelectView({
        required: false,
        name: 'acl',
        label: 'ACL\'s',
        value: this.model.acl
      }),
      new FileInputView({
        name: 'script',
        label: 'Have a script file?',
        buttonLabel: 'Click here to load it',
        callback: (file) => {
          // data has it's own listener
          this.editorView.setEditorContent(file.contents)
          // the filename input view needs to use its setter
          this.filenameInput.setValue(file.name)
        }
      })
    ]

    FormView.prototype.initialize.apply(this, arguments)
  },
  events: {
    keydown: 'onKeyEvent',
    keypress: 'onKeyEvent'
  },
  onKeyEvent (event) {
    if (event.target.nodeName.toUpperCase() == 'INPUT') {
      if (event.keyCode == 13) {
        event.preventDefault()
        event.stopPropagation()
        return false
      }
    }
  },
  focus () {
    this.query('input').focus()
  },
  render () {
    FormView.prototype.render.apply(this, arguments)
    this.query('form').classList.add('form-horizontal')

    // render order mathers
    this.renderHelp()

    this.renderEditor()

    const buttons = new FormButtons()
    this.renderSubview(buttons)
    buttons.on('click:confirm', () => {
      this.submitForm()
    })
  },
  renderEditor () {
    const editorView = new EditorView({
      data: this.model.data,
      extension: this.filenameInput.extension
    })

    this.editorView = editorView
    this.renderSubview(editorView)

    editorView.codemirror.on('drop', this.onEditorDrop)

    editorView.setEditorMode('js', (err, mimetype) => {
      this.model.mimetype = mimetype
    })

    this.listenToAndRun(this.model, 'change:data', () => {
      editorView.setEditorContent(this.model.data)
    })

    if (this.model.isNew()) {
      editorView.setEditorContent(Boilerplate)
    }
  },
  renderHelp () {
    this.addHelpIcon('acl')
    this.addHelpIcon('filename')
    this.addHelpIcon('description')
    this.addHelpIcon('script')

    var textnode = document.createTextNode(' or you can also drop it into the Editor')
    this._fieldViews['script']
      .el.querySelector('.upload-btn-wrapper')
      .appendChild(textnode)
  },
  addHelpIcon (field) {
    const view = this._fieldViews[field]
    if (!view) { return }
    view.renderSubview(
      new HelpIcon({
        text: HelpTexts.file.form[field]
      }),
      view.query('label')
    )
  },
  onEditorDrop (instance, event) {
    const dt = event.dataTransfer
    if (dt.files.length === 1) {
      this.filenameInput.setValue(dt.files[0].name)
    }
  },
  submitForm () {
    this.beforeSubmit()
    if (!this.valid) { return }
    this.submitCallback()
  },
  verifyLinkedModels (submit) {
    const linkedCollection = this.model.linked_models

    App.state.loader.visible = true
    linkedCollection.once('reset', () => {
      App.state.loader.visible = false
      if (linkedCollection.length > 1) {
        const names = linkedCollection.models.map(task => task.name)
        const message = `
          <p>This script is referenced by the following tasks:</p>
          <ul><li>${names.join("</li><li>")}</li></ul>
          <p>Are you sure you want to save it?</p>
          `

        bootbox.confirm({
          title: 'Save script',
          message: message,
          backdrop: true,
          buttons: {
            confirm: {
              label: 'Yes, please',
              className: 'btn-primary'
            },
            cancel: {
              label: 'I\'m not sure',
              className: 'btn-default'
            }
          },
          callback: (confirmed) => {
            if (confirmed===true) {
              submit()
            }
          }
        })
      } else {
        submit()
      }
    })

    App.actions.file.syncLinkedModels(this.model.id)
  },
  submitCallback () {
    const self = this
    const data = this.prepareData(this.data)

    if (this.model.isNew()) {
      App.actions.file.create(data, function (err, file) {
        self.trigger('submitted', file)
      })
    } else {
      this.verifyLinkedModels(() => {
        App.actions.file.update(this.model.id, data, function (err, file) {
          self.trigger('submitted', file)
        })
      })
    }
  },
  prepareData (args) {
    let f = Object.assign({},
      // most of the data is being directly written to model
      this.model._values,
      args,
      // fixed values
      {
        data: this.editorView.codemirror.getValue()
      }
    )
    return f
  }
})

const FilenameInputView = InputView.extend({
  props: {
    extension: ['string', false, 'js']
  },
  initialize () {
    this.label = 'Filename *'
    this.name = 'filename'
    this.required = true
    this.invalidClass = 'text-danger'
    this.validityClassSelector = '.control-label'
    InputView.prototype.initialize.apply(this,arguments)

    this.tests = [
      value => {
        if (!value) {
          return 'Give it a name'
        }

        if (this.extension !== 'js') {
          return `${this.extension} is not valid for Node.js files`
        }
      }
    ]

    this.on('change:value', () => {
      this.extension = getExtension(this.value)
    })
  }
})

const getExtension = (fname) => {
  return fname.slice((fname.lastIndexOf(".") - 1 >>> 0) + 2)
}
