import PanelButton from 'components/list/item/panel-button'
import HostGroupActions from 'actions/hostgroup'
import bootbox from 'bootbox'
import $ from 'jquery'

export default PanelButton.extend({
  initialize: function (options) {
    this.title = 'Export template'
    this.iconClass = 'fa fa-download dropdown-icon'
    this.className = 'btn btn-primary'
  },
  events: {
    click: function (event) {
      var self = this
      event.stopPropagation()
      $('.dropdown.open .dropdown-toggle').dropdown('toggle')

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
