import PanelButton from 'components/list/item/panel-button'
import bootbox from 'bootbox'
import FileActions from 'actions/file'

module.exports = PanelButton.extend({
  initialize (options) {
    this.tip = 'Delete File'
    this.iconClass = 'fa fa-trash'
    this.className = 'btn btn-primary'
  },
  events: {
    click: function (event) {
      event.stopPropagation()
      const msg = 'The File will be removed and all the tasks and monitors that depends on it will be desactivated. Do you want to continue?'
      bootbox.confirm(msg, (confirmed) => {
        if (!confirmed) { return }
        FileActions.remove(this.model.id)
      })
    }
  }
})
