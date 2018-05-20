import MassiveDeleteButton from 'components/list/header/buttons/massive-delete'
import TaskActions from 'actions/task'

module.exports = MassiveDeleteButton.extend({
  initialize () {
    MassiveDeleteButton.prototype.initialize.apply(this,arguments)
    this.name = 'tasks'
    this.displayProperty = 'name'
  },
  deleteItems (tasks) {
    TaskActions.massiveDelete(tasks)
  }
})
