import App from 'ampersand-app'
import PanelButton from 'components/list/item/panel-button'
import bootbox from 'bootbox'
import $ from 'jquery'

export default PanelButton.extend({
  initialize: function (options) {
    this.title = 'Resend invitation'
    this.order = 900
    this.className = 'btn btn-primary dropdown-icon reSendInvitation'
    this.iconClass = 'fa fa-share'
  },
  events: {
    'click': function resendInvitation (event) {
      event.stopPropagation()
      $('.dropdown.open .dropdown-toggle').dropdown('toggle')
      App.actions.user.resendInvitation(this.model.id)
    }
  }
})
