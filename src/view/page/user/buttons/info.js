'use strict'

import View from 'ampersand-view'
import Clipboard from 'clipboard'
import CommonButton from 'components/common-button'
import merge from 'lodash/merge'
import Modalizer from 'components/modalizer'
import config from 'config'

export default CommonButton.extend({
  initialize (options) {
    this.title = 'Waiting activation'
    this.className = 'btn btn-primary dropdown-icon'
    this.iconClass = 'fa fa-info-circle'
    this.show = Boolean(!this.model.enabled && this.model.invitation_token)
  },
  //onclick (event) {
  //  event.stopPropagation()
  //  const url = `${config.app_url}/activate?token=${this.model.invitation_token}`
  //  const content = View.extend({
  //    template: function(){
  //      return `
  //        <div>
  //          <span>${url}</span>
  //          <button data-clipboard-text="${url}">
  //            <i class="fa fa-clipboard"></i>
  //          </button>
  //        </div>`
  //    },
  //    render () {
  //      this.renderWithTemplate(this)
  //      new Clipboard( this.query('button') )
  //    }
  //  })
  //  const modal = new Modalizer ({
  //    title: 'Activation link',
  //    bodyView: new content({})
  //  })
  //  modal.show()
  //},
  //events: merge({}, CommonButton.prototype.events, {
  //  'click': 'onclick'
  //})
})
