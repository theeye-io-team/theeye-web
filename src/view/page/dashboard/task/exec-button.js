import View from 'ampersand-view'
import ladda from 'ladda'
const logger = require('lib/logger')('page:dashboard:task:exec-button')

module.exports = View.extend({
  template: `
    <li>
      <button data-hook="trigger"
        class="ladda-button btn btn-primary tooltiped" 
        title="Run this task"
        data-spinner-size="30"
        data-style="zoom-in">
        <i class="fa fa-play" aria-hidden="true"></i>
      </button>
    </li>
  `,
  initialize () {
    View.prototype.initialize.apply(this,arguments)
  },
  render () {
    this.renderWithTemplate()

    this.lbutton = ladda.create( this.queryByHook('trigger') )

    this.listenToAndRun(this.model,'change:state',() => {
      this.checkJobState()
    })
  },
  props: {
    disabled: ['boolean',false,false]
  },
  bindings: {
    disabled: {
      hook: 'trigger',
      type: 'booleanAttribute',
      name: 'disabled'
    }
  },
  checkJobState () {
    const state = this.model.state
    switch (state) {
      case 'new':
      case 'sent':
        this.lbutton.start()
        break;
      default:
        this.lbutton.stop()
        break;
    }
  }
})
