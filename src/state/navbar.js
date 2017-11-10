import State from  'ampersand-state'
import SessionActions from 'actions/session'
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
        passports: ['object',false,undefined],
      },
      initialize () {
        State.prototype.initialize.apply(this,arguments)

        this.listenTo(this,'change:visible',() => {
          if (this.visible===true) {
            SessionActions.getUserPassport()
            if(Acls.hasAccessLevel('admin')){
              App.state.members.fetch({
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
