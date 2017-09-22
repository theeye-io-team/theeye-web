import PanelButton from 'components/list/item/panel-button'
import HostGroupActions from 'actions/hostgroup'
import bootbox from 'bootbox'

module.exports = PanelButton.extend({
  initialize: function (options) {
    this.title = 'Delete Host Template'
    this.iconClass = 'fa fa-trash'
    this.className = 'btn btn-primary simple-btn tooltiped'
  },
  events: {
    click: function (event) {
      event.stopPropagation()
      const msg = 'Continue removing the template? Template hosts will be unlinked and all the monitors and tasks will be removed as well'
      bootbox.confirm(msg, (confirmed) => {
        if (!confirmed) return
        HostGroupActions.remove(this.model.id)
      })
    }
  }
})
