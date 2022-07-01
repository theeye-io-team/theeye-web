import App from 'ampersand-app'
import Modalizer from 'components/modalizer'
import FullPageModal from 'components/full-page-modal'
import HelpTexts from 'language/help'
import HelpIconView from 'components/help-icon'
import WorkflowFormView from '../form'
import View from 'ampersand-view'
import config from 'config'
import FileInputView from 'components/input-view/file'

import { Workflow } from 'models/workflow'

import './styles.less'

const docsLink = 'core-concepts/tasks/tasks_workflows/'

export default function () {
  const wizard = new CreationWizard()
  wizard.render()

  const modal = new Modalizer({
    buttons: false,
    title: 'Workflows Panel',
    bodyView: wizard
  })

  modal.renderSubview(
    new HelpIconView({ link: `${config.docs}/${docsLink}` }),
    modal.queryByHook('title')
  )

  modal.on('hidden',() => {
    modal.remove()
  })

  wizard.on('removed', () => {
    modal.hide()
  })

  modal.show()

  return modal
}

const CreationWizard = View.extend({
  template: `
    <div>
      <section data-hook="selection-container" class="task-type-selection">
        <div data-hook="buttons" class="row task-button" style="text-align:center;">
          <div class="col-xs-3">
            <button data-hook="create" class="btn btn-default">
              <i class="icons icons-script fa fa-code"></i>
            </button>
            <h2>Create</h2>
          </div>
        </div>
      </section>
    </div>
  `,
  events: {
    'click button[data-hook=create]': function (event) {
      event.preventDefault()
      event.stopPropagation()
      renderCreateForm()
      this.remove()
    }
  },
  render () {
    this.renderWithTemplate(this)
    this.renderImportButton()
  },
  renderImportButton () {
    const importButton = new ImportButton({
      callback: (file) => {
        if (
          file &&
          /json\/*/.test(file.type) === true &&
          file.contents &&
          file.contents.length
        ) {
          const serial = JSON.parse(file.contents)
          const workflow = App.actions.workflow.parseSerialization(serial)
          renderCreateForm(workflow)
          this.remove()
        } else {
          bootbox.alert('File not supported, please select a JSON file.')
        }
      }
    })

    this.renderSubview(importButton, this.queryByHook('buttons'))
  },
  remove () {
    this.trigger('removed')
    View.prototype.remove.apply(this,arguments)
  },
  update () {
    // DO NOT REMOVE. must do nothing
  }
})

const renderCreateForm = (workflow = null) => {
  if (workflow === null) {
    workflow = new Workflow({ version: 2 })
  }

  const editView = new WorkflowFormView({ model: workflow, builder_mode: 'import' })

  const modal = new FullPageModal({
    buttons: false,
    title: 'Create Workflow',
    bodyView: editView 
  })

  modal.renderSubview(
    new HelpIconView({ link: `${config.docs}/${docsLink}` }),
    modal.queryByHook('title')
  )

  modal.on('hidden', () => {
    editView.remove()
    modal.remove()
  })

  editView.on('submit', (data) => {
    App.actions.workflow.create(data)
    modal.hide()
  })

  modal.show()
  return modal
}

const ImportButton = FileInputView.extend({
  initialize () {
    FileInputView.prototype.initialize.apply(this, arguments)
    this.styles = 'col-xs-3'
  },
  events: {
    'click button': function (event) {
      event.preventDefault()
      event.stopPropagation()
      this.input.click()
    }
  },
  template: `
    <div class="col-xs-3">
      <div class="upload-btn-wrapper">
        <button for="file-upload" data-hook="button-label" class="btn btn-default">
          <i class="icons icons-approval fa fa-thumbs-o-up"></i>
        </button>
        <input style="display:none;" id="file-upload" type="file">
        <h2>Import<span data-hook="approval-help"></span></h2>
      </div>
    </div>
  `,
})
