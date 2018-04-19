import View from 'ampersand-view'
import App from 'ampersand-app'
import Modalizer from 'components/modalizer'
import ChangePasswordFormView from './password-form'
import AuthActions from 'actions/auth'
import '../settings.css'

const SocialConnection = View.extend({
  template: `
    <div class="row border social">
      <div class="col-xs-6">
        <div class="social-container">
          <span class="circle go"></span>
          <span class="legend go" data-hook="social-connection-name"></span>
        </div>
      </div>
      <div class="col-xs-6">
        <div data-hook="social-connection-status-connected">
          <span class="gray">CONNECTED</span>
          <a href="/disconnect/google" class="blue pull-right">DISCONNECT</a>
        </div>
        <div data-hook="social-connection-status-disconnected">
          <span class="gray">DISCONNECTED</span>
          <a href="/connect/google" class="blue pull-right">CONNECT</a>
        </div>
      </div>
    </div>`,
  props: {
    name: ['string', false, ''],
    passports: ['object', false, () => { return {} }]
  },
  bindings: {
    'name': {
      type: 'text',
      hook: 'social-connection-name'
    },
    'status': [
      {
        type: 'toggle',
        hook: 'social-connection-status-connected'
      }, {
        type: 'toggle',
        hook: 'social-connection-status-disconnected',
        invert: true
      }
    ]
  },
  derived: {
    status: {
      deps: ['passports'],
      fn: function () {
        if (this.passports && this.passports.oauth2) {
          return true
        }
        return false
      }
    }
  },
  initialize () {
    this.listenToAndRun(App.state.navbar.settingsMenu, 'change', () => {
      this.updateState(App.state.navbar.settingsMenu)
    })
  },
  updateState (state) {
    this.passports = state.passports
  }
})

module.exports = View.extend({
  template: require('./template.hbs'),
  props: {
    email: ['string', false, ''],
    username: ['string', false, ''],
    name: ['string', false, '']
  },
  bindings: {
    'email': {
      type: 'text',
      hook: 'account-email'
    },
    'username': {
      type: 'text',
      hook: 'account-username'
    },
    'name': {
      type: 'text',
      hook: 'account-name'
    }
  },
  initialize () {
    this.email = App.state.session.user.email
    this.username = App.state.session.user.username
    this.name = App.state.session.user.name
  },
  events: {
    'click [data-hook=change-password]': 'changePassword'
  },
  changePassword: function (event) {
    event.stopPropagation()

    const form = new ChangePasswordFormView()

    const modal = new Modalizer({
      confirmButton: 'Save',
      buttons: true,
      title: 'Change password',
      bodyView: form,
      class: 'settings-modal'
    })

    this.listenTo(modal, 'shown', function () { form.focus() })
    this.listenTo(modal, 'hidden', function () {
      form.remove()
      modal.remove()
    })
    this.listenTo(modal, 'confirm', function () {
      form.beforeSubmit()
      if (!form.valid) return
      AuthActions.changePassword(App.state.session.user.id, form.data)
      modal.hide()
    })
    modal.show()
  },
  render () {
    this.renderWithTemplate(this)

    const googleConnection = new SocialConnection({
      name: 'Google +'
    })

    this.renderSubview(
      googleConnection,
      this.queryByHook('google-connection-container')
    )
  }
})
