import App from 'ampersand-app'
import State from  'ampersand-state'

export default State.extend({
  props: {
    current_tab: 'string',
    visible: 'boolean',
    agent: 'object'
  },
  derived: {
    default_tab: { fn() { return 'groups' } }
  },
  initialize () {
    State.prototype.initialize.apply(this,arguments)

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