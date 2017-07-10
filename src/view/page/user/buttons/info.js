import PanelButton from 'components/list/item/panel-button'
import merge from 'lodash/merge'
import bootbox from 'bootbox'

export default PanelButton.extend({
  initialize: function (options) {
    this.title = 'activation link'
    this.order = 800
    this.className = 'btn btn-primary simple-btn tooltiped'
    this.iconClass = 'glyphicon glyphicon-info-sign'
    this.show = Boolean(!this.model.enabled && this.model.invitation_token)
  },
  events: merge({}, PanelButton.prototype.events, {
    'click': function showActivationLink (event) {
      event.stopPropagation()
      bootbox.alert({
        title: 'Activation link:',
        message: `${window.location.origin}/activate?token=${this.model.invitation_token}`
      })
    }
  })
})
