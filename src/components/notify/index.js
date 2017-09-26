import App from 'ampersand-app'
import View from 'ampersand-view'
import './styles.css'
import 'bootstrap-tooltip'

module.exports = View.extend({
  template: `
    <div class="notify-component"  data-placement="bottom">
      <i data-hook="icon" class="fa fa-bell-o">
        <span data-hook="badges" class="badge"></span>
      </i>
    </div>
  `,
  props: {
    visible: 'boolean',
    badges: 'number',
    message: 'string'
  },
  bindings: {
    visible: {
      type: 'toggle'
    },
    message: [{
      type: 'attribute',
      name: 'title'
    },{
      type: 'attribute',
      name: 'data-original-title'
    }],
    badges: [{
      type: 'text',
      hook: 'badges'
    },{
      type: 'booleanClass',
      name: 'red'
    }]
  },
  initialize () {
    View.prototype.initialize.apply(this,arguments)
    this.listenToAndRun(App.state.notify,'change',this.updateState)
  },
  updateState () {
    this.visible = App.state.notify.visible

    const count = App.state.notify.badges
    if (count === 0) {
      this.badges = null
      this.message = 'No hay anuncios sin publicar'
    } else {
      this.badges = count
      this.message = `Hay ${count} anuncios sin publicar`
    }
  },
  render () {
    this.renderWithTemplate(this)

    $(this.el).tooltip()
  }
})
