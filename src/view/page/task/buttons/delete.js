import App from 'ampersand-app'
import PanelButton from 'components/list/item/panel-button'
import bootbox from 'bootbox'

module.exports = PanelButton.extend({
  initialize (options) {
    this.tip = 'Delete Task'
    this.iconClass = 'fa fa-trash'
    this.className = 'btn btn-primary'
  },
  events: {
    click: function (event) {
      event.stopPropagation()
      this.deleteTask(this.model)
    }
  },
  deleteTask (model, callback) {
    if (model.hasWorkflow) {
      bootbox.alert({
        title: 'Warning',
        message: `
        <div>
          <p>This task cannot be deleted because it belongs to a workflow.</p>
          <p>If you want to delete the task, remove it from all the workflows it belongs to first.</p>
        </div>`
      })
    } else {
      const msg = 'The task and all its schedules will be removed. Do you want to continue?'
      bootbox.confirm(msg, (confirmed) => {
        if (!confirmed) { return }
        App.actions.task.remove(model.id)
      })
      if (callback) callback()
    }
  }
})
