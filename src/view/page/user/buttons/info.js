'use strict'

import View from 'ampersand-view'
import Clipboard from 'clipboard'
import CommonButton from 'components/common-button'
import Modalizer from 'components/modalizer'
import config from 'config'

export default CommonButton.extend({
  initialize (options) {
    this.title = 'Waiting activation'
    this.className = 'btn btn-primary dropdown-icon'
    this.iconClass = 'fa fa-info-circle'
    this.show = Boolean(!this.model.enabled && this.model.invitation_token)
  }
})
