import PanelButton from 'components/list/item/panel-button'
import bootbox from 'bootbox'
import App from 'ampersand-app'

module.exports = PanelButton.extend({
  initialize (options) {
    this.tip = 'Delete File'
    this.iconClass = 'fa fa-trash'
    this.className = 'btn btn-primary'
  },
  events: {
    click: function (event) {
      event.stopPropagation()
      const msg = 'The File will be removed and the information on it will be lost forever. Do you want to continue?'
      bootbox.confirm(msg, (confirmed) => {
        if (!confirmed) { return }
        App.actions.file.remove(this.model.id)
      })
    }
  }
})
