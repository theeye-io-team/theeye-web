import App from 'ampersand-app'
import State from  'ampersand-state'

export default State.extend({
  props: {
    showTaskLastStep: ['boolean',false,false],
    onboardingActive: ['boolean',false,false]
  }
})
