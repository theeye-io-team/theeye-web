import View from 'ampersand-view'
import App from 'ampersand-app'
import Modalizer from 'components/modalizer'
import ChangePasswordFormView from './password-form'
import AuthActions from 'actions/auth'
import './styles.less'

export default View.extend({
  template: () => {
    let html = `
      <div data-component=user-accounts>
        <h3 class="blue bold">CREDENTIALS</h3>
        <div class="row border">
          <div class="col-xs-12">
            <h4 class="blue"><i class="fa fa-user"></i> User Profile</h4>
            <div class="row">
              <strong class="col-sm-3">credential</strong>
              <span data-hook="credential" class="col-sm-9"></span>
            </div>
            <div class="row">
              <strong class="col-sm-3">name</strong>
              <span data-hook="name" class="col-sm-9"></span>
            </div>
            <div class="row">
              <strong class="col-sm-3">username</strong>
              <span data-hook="username" class="col-sm-9"></span>
            </div>
            <div class="row">
              <strong class="col-sm-3">email</strong>
              <span data-hook="email" class="col-sm-9"></span>
            </div>
            <a class="blue btn btn-default btn-lg pull-right" data-hook="change-password">Change password</a>
          </div>
        </div>
        <!-- SOCIAL PROVIDER AUTHENTICATION -->
        <div class="social-providers row border" data-hook="connect-section">
          <div class="col-xs-12">
            <h4 class="blue"><i class="fa fa-link"></i> Connect with:</h4>
            <div data-hook="connection-container"></div>
          </div>
        </div>
      </div>
    `
    return html
  },
  props: {
    email: ['string', false, ''],
    username: ['string', false, ''],
    name: ['string', false, ''],
    credential: ['string', false, ''],
    show_account_actions: ['boolean', false, true]
  },
  bindings: {
    'email': { hook: 'email' },
    'username': { hook: 'username' },
    'name': { hook: 'name' },
    'credential': { hook: 'credential' },
    'show_account_actions': [
      {
        type: 'toggle',
        hook: 'change-password'
      },
      {
        type: 'toggle',
        hook: 'connect-section'
      }
    ]
  },
  initialize () {
    this.listenToAndRun(App.state.session, 'change', () => {
      this.updateState(App.state.session)
    })
  },
  updateState (session) {
    this.credential = session.user.credential
    this.email = session.user.email
    this.username = session.user.username
    this.name = session.user.name
    this.show_account_actions = session.show_account_actions
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

    this.renderSubview(
      new SocialConnection({ name: 'Google +', provider: 'google' }),
      this.queryByHook('connection-container')
    )
  }
})

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
          <a data-hook="disconnect-button" class="blue pull-right">DISCONNECT</a>
        </div>
        <div data-hook="social-connection-status-disconnected">
          <a data-hook="connect-button" class="blue pull-right">CONNECT</a>
          <span class="gray">DISCONNECTED</span>
        </div>
      </div>
    </div>`,
  props: {
    name: ['string', true, ''],
    provider: ['string', true, ''],
    passport: ['object', false, () => { return {} }]
  },
  bindings: {
    name: {
      type: 'text',
      hook: 'social-connection-name'
    },
    status: [
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
    /** @type boolean */
    status: {
      deps: ['passport'],
      fn () {
        return this.passport.hasOwnProperty('provider')
      }
    }
  },
  initialize () {
    this.listenToAndRun(App.state.settingsMenu.user, 'change', () => {
      this.updateState(App.state.settingsMenu.user)
    })
  },
  updateState (state) {
    let passports = state.passports
    if (!Array.isArray(passports) || passports.length === 0) { // reset
      this.passport = {}
    } else {
      let passport = passports.find(p => p.provider === this.provider)
      if (passport) {
        this.passport = passport
      }
    }
  },
  events: {
    'click a[data-hook=disconnect-button]':'onClickDisconnect',
    'click a[data-hook=connect-button]':'onClickConnect'
  },
  onClickConnect (event) {
    event.preventDefault()
    event.stopPropagation()

    App.actions.auth.connectProvider(this.provider)
  },
  onClickDisconnect (event) {
    event.preventDefault()
    event.stopPropagation()

    App.actions.auth.disconnectProvider(this.passport)
  },
})
