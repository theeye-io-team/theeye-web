import App from 'ampersand-app'
import Modalizer from 'components/modalizer'
import PanelButton from 'components/list/item/panel-button'
import $ from 'jquery'
import View from 'ampersand-view'
import './remove.less'

export default PanelButton.extend({
  initialize (options) {
    this.title = 'Remove'
    this.iconClass = 'fa fa-trash dropdown-icon'
    this.className = 'btn btn-primary'
  },
  events: {
    click (event) {
      event.stopPropagation()
      $('.dropdown.open .dropdown-toggle').dropdown('toggle')

      const content = new DialogContent({ model: this.model })

      const dialog = new Modalizer({
        fade: false,
        center: true,
        buttons: false,
        title: 'Delete Workflow',
        bodyView: content
      })

      dialog.on('hidden',() => {
        content.remove()
        dialog.remove()
      })

      content.on('clicked', () => {
        dialog.hide() // hide and auto-remove
      })

      dialog.show()
    }
  }
})

const DialogContent = View.extend({
  template () {
    return (`
      <div data-component="delete-workflow-dialog">
        <div class="grid-container">
          <!-- row 2 -->
          <div class="grid-col-button">
            <button type="button" class="btn btn-default" data-hook="download-recipe">
              <i class="fa fa-arrow-right"></i>
            </button>
          </div>
          <div class="grid-col-message">
            <span><b>Download a backup of the Workflow</b></span>
          </div>

          <!-- row 1 -->
          <div class="grid-col-button">
            <button type="button" class="btn btn-default" data-hook="keep-tasks">
              <i class="fa fa-arrow-right"></i>
            </button>
          </div>
          <div class="grid-col-message">
            <span><b>Delete the Workflow but keep copies of the Tasks</b></span>
          </div>

          <!-- row 2 -->
          <div class="grid-col-button">
            <button type="button" class="btn btn-default" data-hook="delete-everything">
              <i class="fa fa-arrow-right"></i>
            </button>
          </div>
          <div class="grid-col-message">
            <span><b>Delete the Workflow and all the Tasks</b></span>
          </div>

          <!-- row 3 -->
          <div class="grid-col-button">
            <button type="button" class="btn btn-default" data-hook="cancel">
              <i class="fa fa-arrow-left"></i>
            </button>
          </div>
          <div class="grid-col-message">
            <span><b>Get me Back</b></span>
          </div>
        </div>
      </div>
    `)
  },
  events: {
    'click [data-hook=download-recipe]': 'clickDownloadRecipe',
    'click [data-hook=delete-everything]': 'clickDeleteEverything',
    'click [data-hook=keep-tasks]': 'clickKeepTasks',
    'click [data-hook=cancel]': 'clickCancelButton'
  },
  clickDownloadRecipe (event) {
    event.preventDefault()
    event.stopPropagation()
    App.actions.workflow.exportRecipe(this.model.id)
    return false
  },
  clickDeleteEverything (event) {
    event.preventDefault()
    event.stopPropagation()
    App.actions.workflow.remove(this.model.id, /* keepTasks */ false)
    this.trigger('clicked')
  },
  clickKeepTasks (event) {
    event.preventDefault()
    event.stopPropagation()
    App.actions.workflow.remove(this.model.id,  /* keepTasks */ true)
    this.trigger('clicked')
  },
  clickCancelButton (event) {
    event.preventDefault()
    event.stopPropagation()
    // canceled. do nothing
    this.trigger('clicked')
  }
})
