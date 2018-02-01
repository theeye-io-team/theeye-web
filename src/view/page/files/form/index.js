import App from 'ampersand-app'
import assign from 'lodash/assign'
import FormView from 'ampersand-form-view'
import View from 'ampersand-view'
import FileActions from 'actions/file'
import ScriptActions from 'actions/script'
import InputView from 'components/input-view'
import TextareaView from 'components/input-view/textarea'
import FormButtons from 'components/form/buttons'
// const FileModeConst = require('constants/file-input-mode')
import FileInputView from 'components/input-view/file'
import CommonButton from 'components/common-button'
import { EditorView } from './editor'
import OnBoarding from 'view/taskOnboarding'
import OnboardingActions from 'actions/onboarding'

const FilenameInputView = InputView.extend({
  props: {
    extension: ['string',false,undefined]
  },
  initialize () {
    this.label = 'Filename *'
    this.name = 'filename'
    this.required = true
    this.invalidClass = 'text-danger'
    this.validityClassSelector = '.control-label'
    this.tests = [
      value => {
        if (value && !this.extension) {
          return 'Filename needs an extension'
        }
      }
    ]
    InputView.prototype.initialize.apply(this,arguments)

    this.listenToAndRun(this,'change:value',() => {
      this.onFilenameChange()
    })
  },
  onFilenameChange () {
    let fname = this.value

    function extension (fname) {
      return fname.slice((fname.lastIndexOf(".") - 1 >>> 0) + 2)
    }

    this.extension = extension(fname) || null
  }
})

const IntroView = View.extend({
  template: `<p class="bg-info" style="padding: 8px;">
    <span class="label label-success">New</span>&nbsp;
    Use the editor to type/paste your script, or just drag n'drop a file
    <strong>into</strong> the editor. Code highlighting
    is set when you name your script with extension.
  </p>`
})

const ExampleBtn = CommonButton.extend({
  initialize (options) {
    this.title = 'Load Example'
    this.className = 'btn btn-primary example-btn'
    this.onClickButton = options.onClickButton
  }
})

module.exports = FormView.extend({
  initialize (options) {
    // needed for codemirror listener
    this.onEditorDrop = this.onEditorDrop.bind(this)
    this.loadExample = this.loadExample.bind(this)

    this.filenameInput = new FilenameInputView({ value: this.model.filename })

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

    FormView.prototype.initialize.apply(this, arguments)
  },
  events: {
    keydown: 'onKeyEvent',
    keypress: 'onKeyEvent'
  },
  onKeyEvent (event) {
    if(event.target.nodeName.toUpperCase()=='INPUT') {
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

    // new editor and modal behavior info, added 1/12/17
    // remove when everybody knows how to use it?
    let intro = new IntroView()
    intro.render()
    this.el.prepend(intro.el)

    this.exampleBtnView = new ExampleBtn({onClickButton: this.loadExample})
    this.renderSubview(this.exampleBtnView)

    this.editorView = new EditorView({
      data: this.model.data,
      extension: this.filenameInput.extension
    })

    this.renderSubview(this.editorView)
    this.editorView.codemirror.on('drop', this.onEditorDrop)

    this.listenToAndRun(this.filenameInput,'change:extension',() => {
      this.editorView.setEditorMode(this.filenameInput.extension)
    })

    this.listenToAndRun(this.model,'change:data',() => {
      this.editorView.setEditorContent(this.model.data)
    })

    this.listenTo(App.state.editor,'change:value',() => {
      if(App.state.editor.value && App.state.editor.value.length)
        this.editorView.setEditorContent(App.state.editor.value)
      else {
        this.editorView.clearEditorContent()
      }
    })

    const buttons = this.buttons = new FormButtons()
    this.renderSubview(buttons)
    buttons.on('click:confirm', () => { this.submitForm() })

    if (!this.model.filename) {
      if(App.state.onboarding.onboardingActive) {
        var onBoarding = new OnBoarding({parent: this})
        this.registerSubview(onBoarding)
        onBoarding.step3()

        buttons.on('click:confirm', () => { OnboardingActions.showTaskLastStep() })
      }
    }
  },
  onEditorDrop (instance, event) {
    const dt = event.dataTransfer
    if (dt.files.length === 1) {
      this.filenameInput.setValue(dt.files[0].name)
    }
  },
  loadExample(event) {
    if(event){
      event.stopPropagation()
      event.preventDefault()
    }
    ScriptActions.getExampleScript(this.filenameInput.extension)
  },
  submitForm () {
    this.beforeSubmit()
    if (!this.valid) return
    this.submitCallback(this.data)
  },
  submitCallback (obj) {
    let file
    let data = this.prepareData(obj)
    if (!this.model.isNew()) {
      file = FileActions.update(this.model.id, data)
    } else {
      file = FileActions.create(data)
    }

    this.trigger('submitted', file)
  },
  prepareData (args) {
    let f = assign(
      {},
      // most of the data is being directly written to model
      this.model._values,
      args,
      // fixed values
      {
        data: this.editorView.codemirror.getValue(),
        is_script: true
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
