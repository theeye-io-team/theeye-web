
import App from 'ampersand-app'
import SelectView from 'components/select2-view'

export default SelectView.extend({
  initialize (options = {}) {

    this.options = [
      { id: 'workflow', name: 'Workflow' }, 
      { id: 'task', name: 'Task' },
      { id: 'indicator',name: 'Indicator' },
      { id: 'monitor', name: 'Monitor' }
    ]

    //this.multiple = true
    //this.tags = true
    this.visible = options.visible || false
    this.label = 'Triggers'
    this.name = 'triggers'
    this.styles = 'form-group'
    this.unselectedText = 'Select the trigger'
    this.idAttribute = 'id'
    this.textAttribute = 'name'

    SelectView.prototype.initialize.apply(this,arguments)
  }
})
