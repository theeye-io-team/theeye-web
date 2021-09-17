import PanelButton from 'components/list/item/panel-button'
import Modalizer from 'components/modalizer'
import $ from 'jquery'
import App from 'ampersand-app'
import { Workflow } from 'models/workflow'
import WorkflowFormView from '../form'

//import State from 'ampersand-state'
//import graphlib from 'graphlib'
//import { Collection } from 'models/task'

export default PanelButton.extend({
  initialize (options) {
    this.title = 'Copy workflow'
    this.iconClass = 'fa fa-copy dropdown-icon'
    this.className = 'btn btn-primary'
  },
  events: {
    click (event) {
      event.stopPropagation()
      $('.dropdown.open .dropdown-toggle').dropdown('toggle')

      App.actions.workflow.populate(this.model)
      const recipe = App.actions.workflow.createRecipe(this.model, {})

      // store:false avoid merging the state into the app.state
      const workflow = new Workflow(recipe, {store: false})

      //const workflow = new (State.extend({ extraProperties: 'allow' }))(recipe)
      //workflow.graph = graphlib.json.read(recipe.graph)
      //workflow.tasks = new Collection(recipe.tasks, { store: false })

      const form = new WorkflowFormView({ model: workflow })

      const modal = new Modalizer({
        buttons: false,
        title: `Copy # ${this.model.id}`,
        bodyView: form
      })

      // this.listenTo(modal, 'shown', () => { form.focus() })

      this.listenTo(modal, 'hidden', () => {
        form.remove()
        modal.remove()
      })

      form.on('submit', data => {
        const recipe = App.actions.workflow.createRecipe(workflow)
        App.actions.workflow.importCreate(recipe)
        modal.hide()
      })

      modal.show()
    }
  }
})
