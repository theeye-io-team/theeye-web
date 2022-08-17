import App from 'ampersand-app'
import State from  'ampersand-state'

const MenuState = State.extend({
  props: {
    current_tab: 'string',
    default_tab: ['string', true, 'tasks'],
    visible: 'boolean'
  },
  initialize () {
    State.prototype.initialize.apply(this,arguments)
    this.current_tab = this.default_tab
  }
})

const TaskState = State.extend({
  props: {
    list: 'array',
    fetched: ['boolean', true, false]
  }
})

export default State.extend({
  children: {
    menu: MenuState,
    tasks: TaskState
  }
})
