import PanelButton from 'components/list/item/panel-button'
import merge from 'lodash/merge'
import bootbox from 'bootbox'
import { fetch, defaultOptions, responseHandler } from 'lib/fetch'

module.exports = PanelButton.extend({
  initialize: function (options) {
    this.title = 'resend user invitation'
    this.order = 900
    this.className = 'btn btn-primary reSendInvitation simple-btn tooltiped'
    this.iconClass = 'glyphicon glyphicon-share-alt'
  },
  events: {
    'click': function resendInvitation (event) {
      event.stopPropagation()

      const options = merge({}, defaultOptions, { method: 'PUT' })

      // TODO FLUX: this is where we should call actions/user/resendInvitation
      // or hook action/user/resendInvitation on some model event
      fetch(`/user/${this.model.id}/reinvite`, options)
        .then(responseHandler)
        .then(parsedResponse => {
          bootbox.alert({
            title: 'Invitation',
            message: `You have re-sent the invitation to ${this.model.username}`
          })
        })
        .catch(error => {
          console.log(error)
          bootbox.alert({
            title: 'Invitation error',
            message: error.message
          })
        })
    }
  }
})
