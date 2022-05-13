import App from 'ampersand-app'
import State from  'ampersand-state'

export default State.extend({
  props: {
    current_tab: 'string',
    visible: 'boolean'
  },
  derived: {
    default_tab: { fn() { return 'groups' } }
  }
})