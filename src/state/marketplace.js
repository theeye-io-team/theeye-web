import App from 'ampersand-app'
import State from  'ampersand-state'

export default State.extend({
  props: {
    current_tab: 'string',
    visible: 'boolean',
    tasks: ['array', true, () => { return [] }],
    monitors: ['array', true, () => { return [] }],
    workflows: ['array', true, () => { return [] }],
    indicators: ['array', true, () => { return [] }],
  }
})
