import App from 'ampersand-app'
import $ from 'jquery'
import Clipboard from 'clipboard'
import BaseView from 'view/base-view'
import PanelButton from 'components/list/item/panel-button'
import Modalizer from 'components/modalizer'
import config from 'config'
import Titles from 'language/titles'

import './style.less'

const docsLink = 'integrations/api/api_resources_task/#2-using-the-task-secret-key-40recommended41'

export default PanelButton.extend({
  initialize (options) {
    this.title = Titles.indicator.buttons.integrations
    this.iconClass = 'fa fa-chain dropdown-icon'
    this.className = 'btn btn-primary'
  },
  events: {
    click (event) {
      event.stopPropagation()
      $('.dropdown.open .dropdown-toggle').dropdown('toggle')

      let view = new Content({ model: this.model })

      const modal = new Modalizer({
        buttons: false,
        title: this.title,
        bodyView: view
      })

      this.listenTo(modal, 'hidden', () => {
        view.remove()
        modal.remove()
      })

      modal.show()
    }
  }
})

const Content = BaseView.extend({
  template: `
    <div data-component="indicator-integration" class="indicator-details">

      <div class="row indicator-curl">
        <div class="col-xs-2">
          <label>Update CURL</label>
        </div>
        <div class="col-xs-10">
          <div class="">
            <button class="curl-copy btn btn-primary clip" type="button" data-hook="update-copy">
              <span class="fa fa-files-o" alt="copy to clipboard"></span>
            </button>
            <div class="curl-container" data-hook="update-curl"></div>
          </div>
        </div>
      </div>

      <div class="row indicator-curl" style="padding-top:10px;">
        <div class="col-xs-2">
          <label>Delete CURL</label>
        </div>
        <div class="col-xs-10">
          <div class="">
            <button class="curl-copy btn btn-primary clip" type="button" data-hook="delete-copy">
              <span class="fa fa-files-o" alt="copy to clipboard"></span>
            </button>
            <div class="curl-container" data-hook="delete-curl"></div>
          </div>
        </div>
      </div>

    </div>
  `,
  bindings: {
    'updateCurl': {
      hook: 'update-curl',
      type: 'innerHTML'
    },
    'deleteCurl': {
      hook: 'delete-curl',
      type: 'innerHTML'
    }
  },
  derived: {
    indicatorUrl: {
      deps: ['model.id'],
      fn () {
        const indicatorsURL = App.config.supervisor_api_url + '/indicator'
        let url = [
          "'",
          indicatorsURL,
          `/${this.model.id}`,
          '?access_token={access_token_here}&customer=',
          App.state.session.customer.name,
          "'"
        ]
        return url.join('')
      }
    },
    updateCurl: {
      deps: ['indicatorUrl','model.state'],
      fn () {
        let state = this.model.state==='normal'?'failure':'normal'
        let url = this.indicatorUrl
        let curl = [
          `curl -X PATCH ${url}`,
          ` --header 'Content-Type: application/json'`,
          ` --data '{"state":"${state}"}'`
        ]
        return curl.join('')
      }
    },
    deleteCurl: {
      deps: ['indicatorUrl'],
      fn () {
        let url = this.indicatorUrl
        return `curl -X DELETE ${url}`
      }
    }
  },
  render () {
    this.renderWithTemplate(this)

    new Clipboard(
      this.queryByHook('update-copy'),
      {
        text: () => this.updateCurl
      }
    )

    new Clipboard(
      this.queryByHook('delete-copy'),
      {
        text: () => this.deleteCurl
      }
    )
  }
})
