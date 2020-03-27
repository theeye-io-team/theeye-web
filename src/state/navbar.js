import App from 'ampersand-app'
import State from  'ampersand-state'
import bootbox from 'bootbox'
import SessionActions from 'actions/session'
import TokenActions from 'actions/token'
import MemberActions from 'actions/member'
import CustomerActions from 'actions/customer'

const SettingsMenuState = State.extend({
  props: {
    visible: ['boolean',false,undefined],
    agent: ['object',false,undefined],
    passports: ['object',false,undefined],
    current_tab: ['string',false,undefined]
  },
  initialize () {
    State.prototype.initialize.apply(this,arguments)

    this.on('change:visible', () => {
      if (this.visible===true) {
        SessionActions.getUserPassport()
        CustomerActions.getAgentCredentials()
      }
    })

    this.on('change:current_tab change:visible', () =>  {
      if (this.visible===true) {
        if (this.current_tab==='credentials') {
          TokenActions.fetch()
        }
        if (this.current_tab==='members') {
          MemberActions.fetch()
        }
      }
    })
  }
})

module.exports = State.extend({
  props: {
    menuSwitch: ['boolean',false,false],
    topMenuSwitch: ['boolean',false,false],
    plusMenuSwitch: ['boolean',false,false],
    visible: ['boolean',false,true]
  },
  children: {
    settingsMenu: SettingsMenuState
  }
})
