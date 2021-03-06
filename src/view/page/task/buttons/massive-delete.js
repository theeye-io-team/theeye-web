import App from 'ampersand-app'
import MassiveDeleteButton from 'components/list/header/buttons/massive-delete'

export default MassiveDeleteButton.extend({
  initialize () {
    MassiveDeleteButton.prototype.initialize.apply(this,arguments)
    this.name = 'tasks'
    this.displayProperty = 'name'
  },
  deleteItems (tasks) {
    App.actions.task.massiveDelete(tasks)
  }
})
