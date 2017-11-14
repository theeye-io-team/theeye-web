import App from 'ampersand-app'
import State from  'ampersand-state'
import SessionActions from 'actions/session'
import CustomerActions from 'actions/customer'
import bootbox from 'bootbox'
import Acls from 'lib/acls'

module.exports = State.extend({
  props: {
    menuSwitch: ['boolean',false,false]
  },
  children: {
    settingsMenu: State.extend({
      props: {
        visible: ['boolean',false,undefined],
        agent: ['object',false,undefined],
        passports: ['object',false,undefined]
      },
      initialize () {
        State.prototype.initialize.apply(this,arguments)

        this.listenTo(this,'change:visible',() => {
          if (this.visible===true) {
            SessionActions.getUserPassport()

            if(Acls.hasAccessLevel('admin')){
              CustomerActions.getAgentCredentials()
            }

            if(Acls.hasAccessLevel('manager') && App.state.session.user.credential !== 'admin'){
              App.state.members.fetch({
                success: () => {
                },
                error (err,xhr) {
                  bootbox.alert('Something goes wrong. Please refresh')
                }
              })
            }
          }
        })
      }
    })
  }
})
