import extend from 'lodash/assign'
import App from 'ampersand-app'
import Backdrop from 'components/backdrop'
import './style.css'

export default Backdrop.extend({
  template: `
    <div class="modal-backdrop fade in">
      <div class="loader-component">
        <img src="/images/roboto_loader.gif">
        <h3 data-hook="message"></h3>
      </div>
    </div>
  `,
  props: {
    message: ['string',false,'Espere...'],
    progress: ['number',false,0],
    show_progress: ['boolean',false,false]
  },
  bindings: extend({}, Backdrop.prototype.bindings, {
    message: {
      hook: 'message'
    }
  }),
  initialize (options) {
    // default props values
    this.color = '#000'

    Backdrop.prototype.initialize.apply(this,arguments)

    this.listenTo(App.state.loader,'change',this.updateState)
  },
  updateState () {
    const loader = App.state.loader
    this.visible = loader.visible
    this.message = loader.message || this.message
    this.progress = loader.progress
  }
})
