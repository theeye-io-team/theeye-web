import App from 'ampersand-app'
import PanelButton from 'components/list/item/panel-button'
import HostGroupActions from 'actions/hostgroup'
import bootbox from 'bootbox'

module.exports = PanelButton.extend({
  initialize: function (options) {
    this.title = 'Export template'
    this.iconClass = 'fa fa-download'
    this.className = 'btn btn-primary'
  },
  events: {
    click: function (event) {
      var self = this
      event.stopPropagation()

      bootbox.confirm({
        title: 'Export template',
        message: 'Export this template in JSON format?',
        buttons: {
          confirm: {
            label: 'Confirm',
            className: 'btn-primary'
          },
          cancel: {
            label: 'Cancel',
            className: 'btn-default'
          },
        },
        callback: confirm => {
          if (!confirm) { return }
          HostGroupActions.exportToJSON(self.model.id)
        }
      })
    }
  }
})
