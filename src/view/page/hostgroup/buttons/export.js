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
      event.preventDefault()
      event.stopPropagation()
      $('.dropdown.open .dropdown-toggle').dropdown('toggle')
      HostGroupActions.exportToJSON(this.model)
    }
  }
})
