import App from 'ampersand-app'
import State from  'ampersand-state'

const CustomerSettingsMenuState = State.extend({
  props: {
    current_tab: 'string',
    visible: 'boolean',
    agent: 'object'
  },
  derived: {
    default_tab: {
      fn () {
        if (App.state.session.user.credential === 'manager') {
          return 'members'
        } else {
          return 'installer'
        }
      }
    }
  },
  initialize () {
    State.prototype.initialize.apply(this,arguments)

    //this.current_tab = 'installer'

    this.on('change:visible', () => {
      if (this.visible === true) {
        App.actions.customer.getAgentCredentials()
      }
    })

    this.on('change:current_tab change:visible', () =>  {
      if (this.visible === true) {
        if (this.current_tab === 'credentials') {
          App.actions.token.fetch()
        }
        if (this.current_tab === 'members') {
          App.actions.member.fetch()
        }
      }
    })
  }
})

const UserSettingsMenuState = State.extend({
  props: {
    current_tab: 'string',
    visible: 'boolean',
    passports: 'object'
  },
  derived: {
    default_tab: {
      fn () {
        return 'accounts'
      }
    }
  },
  initialize () {
    State.prototype.initialize.apply(this, arguments)

    this.on('change:visible', () => {
      if (this.visible === true) {
        App.actions.session.getPassports()
      }
    })
  }
})

export default State.extend({
  children: {
    customer: CustomerSettingsMenuState,
    user: UserSettingsMenuState
  }
})
