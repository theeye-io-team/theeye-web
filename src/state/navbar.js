//import App from 'ampersand-app'
import State from  'ampersand-state'

export default State.extend({
  props: {
    menuSwitch: ['boolean',false,false],
    topMenuSwitch: ['boolean',false,false],
    plusMenuSwitch: ['boolean',false,false],
    visible: ['boolean',false,true]
  }
})
