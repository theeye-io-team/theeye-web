'use strict'

import View from 'ampersand-view'
import Clipboard from 'clipboard'
import PanelButton from 'components/list/item/panel-button'
import merge from 'lodash/merge'
import Modalizer from 'components/modalizer'
import config from 'config'

module.exports = PanelButton.extend({
  initialize (options) {
    this.title = 'activation link'
    this.order = 800
    this.className = 'btn btn-primary simple-btn tooltiped'
    this.iconClass = 'glyphicon glyphicon-info-sign'
    this.show = Boolean(!this.model.enabled && this.model.invitation_token)
  },
  onclick (event) {
    event.stopPropagation()

    const url = `${config.app_url}/activate?token=${this.model.invitation_token}`

    const content = View.extend({
      template: function(){
        return `
          <div>
            <span>${url}</span>
            <button data-clipboard-text="${url}">
              <i class="fa fa-clipboard"></i>
            </button>
          </div>`
      },
      render () {
        this.renderWithTemplate(this)

        new Clipboard( this.query('button') )
      }
    })

    const modal = new Modalizer ({
      title: 'Activation link',
      bodyView: new content({})
    })

    modal.show()
  },
  events: merge({}, PanelButton.prototype.events, {
    'click': 'onclick'
  })
})
