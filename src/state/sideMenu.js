import State from 'ampersand-state'

const SideMenuState = State.extend({
  props: {
    customerSearch: ['string', false, '']
  },
  initialize () {
    State.prototype.initialize.apply(this,arguments)
  }
})

export default SideMenuState
