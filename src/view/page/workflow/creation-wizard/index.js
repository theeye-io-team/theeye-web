import App from 'ampersand-app'
import Modalizer from 'components/modalizer'
import HelpTexts from 'language/help'
import HelpIconView from 'components/help-icon'
import View from 'ampersand-view'
import config from 'config'
import Catalogue from 'components/catalogue'
import bootbox from 'bootbox'
import WorkflowCreateForm from '../create-form'

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
      <section data-hook="selection-container" class="container"></section>
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
          WorkflowCreateForm(workflow)
        } else {
          bootbox.alert('File not supported, please select a JSON file.')
        }
        this.parent.hide()
      }

      reader.readAsText(file)
    })
    
    const buttons = [
      {
        name: 'Create',
        id: 'create',
        short_description: 'Start working on a new Workflow from scratch',
        callback: () => {
          WorkflowCreateForm()
          this.parent.hide()
        },
        icon_class: 'fa fa-sitemap',
        icon_color: '#93278f',
        icon_image: '/images/svg/sq_create-workflows.svg',
      }, {
        name: 'Import',
        id: 'import',
        short_description: 'Create a workflow from one of your recipes',
        callback: () => {
          this.queryByHook('recipe-upload').click()
        },
        icon_class: 'fa fa-file-o',
        icon_color: '#9fbc75',
        icon_image: undefined,
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
