import App from 'ampersand-app'
import NavbarActions from 'actions/navbar'
import View from 'ampersand-view'
import FullContainer from 'components/fullpagecontainer'

import './settings.css'

const Content = View.extend({
  template: require('./template.hbs'),
})

module.exports = FullContainer.extend({
  autoRender: true,
  props: {
    visible: ['boolean',false,false]
  },
  bindings: {
    visible: { type: 'toggle' }
  },
  initialize () {
    FullContainer.prototype.initialize.apply(this,arguments)

    this.autoAppend = true
    this.content = new Content()

    this.listenToAndRun(App.state.navbar.settingsMenu,'change',() => {
      this.updateState(App.state.navbar.settingsMenu)
    })
  },
  updateState (state) {
    if (!state) return
    this.visible = state.visible
  },
  events: {
    'click [data-hook=close-button]':'onClickCloseButton'
  },
  onClickCloseButton (event) {
    event.preventDefault()
    event.stopPropagation()

    NavbarActions.hideSettingsMenu()
  }
})
