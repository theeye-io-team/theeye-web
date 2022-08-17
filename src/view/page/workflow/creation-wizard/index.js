import App from 'ampersand-app'
import Modalizer from 'components/modalizer'
import FullPageModalizer from 'components/fullpagemodalizer'
import HelpTexts from 'language/help'
import HelpIconView from 'components/help-icon'
import WorkflowEditorView from '../editor'
import View from 'ampersand-view'
import config from 'config'
import Catalogue from 'components/catalogue'
import bootbox from 'bootbox'
import { Workflow } from 'models/workflow'

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
      <section data-hook="selection-container" class="task-type-selection"></section>
      <input type="file" data-hook="recipe-upload" style="display: none"/>
    </div>
  `,
  render () {
    this.renderWithTemplate(this)

    this.queryByHook('recipe-upload').addEventListener('change', (e) => {
      const reader = new window.FileReader()
      const file = e.target.files[0]
      
      reader.onloadend = event => {
        file.contents = event.target.result
        if (
          file &&
          /json\/*/.test(file.type) === true &&
          file.contents &&
          file.contents.length
        ) {
          const serial = JSON.parse(file.contents)
          const workflow = App.actions.workflow.parseSerialization(serial)
          renderCreateForm(workflow)
        } else {
          bootbox.alert('File not supported, please select a JSON file.')
        }
        this.parent.hide()
      }

      reader.readAsText(file)
    })
    
    const buttons = [
      {
        name: "Create",
        id: "create",
        description: "Start working on a new Workflow from scratch",
        callback: () => {
          renderCreateForm()
          this.parent.hide()
        },
        icon_class: "fa-sitemap",
        color: "#c6639b"
      }, {
        name: "Import",
        id: "import",
        description: "Create a workflow from one of your recipes",
        callback: () => {
          this.queryByHook('recipe-upload').click()
        },
        icon_class: 'fa-file-o',
        color: '#9fbc75'
      }
    ]

    this.renderSubview(
      new Catalogue({ buttons }),
      this.queryByHook('selection-container')
    )
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

  const editorView = new WorkflowEditorView({ model: workflow, builder_mode: 'import' })

  const modal = new FullPageModalizer({
    buttons: false,
    title: 'Create Workflow',
    bodyView: editorView 
  })

  modal.renderSubview(
    new HelpIconView({ link: `${config.docs}/${docsLink}` }),
    modal.queryByHook('title')
  )

  modal.on('hidden', () => {
    editorView.remove()
    modal.remove()
  })

  editorView.on('submit', (data) => {
    App.actions.workflow.create(data)
    modal.hide()
  })

  modal.show()
  return modal
}
