import App from 'ampersand-app'
import FullContainer from 'components/fullpagecontainer'
import './styles.less'

export default FullContainer.extend({
  template: `<div data-component="settings-container" class="full-page-container"></div>`,
  autoRender: true,
  props: {
    visible: ['boolean',false,false],
    current_tab: 'string',
    name: 'string'
  },
  bindings: {
    visible: { type: 'toggle' }
  },
  initialize () {
    FullContainer.prototype.initialize.apply(this,arguments)
    this.autoAppend = true
  },
  render () {
    FullContainer.prototype.render.apply(this,arguments)

    this.on('change:visible', () => {
      if (this.visible === true) {
        window.scrollTo(0,0)
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = 'auto'
      }
    })

    this.renderTabs()

    const selectCurrentTab = () => {
      let tab = this.current_tab
      let selector = `[data-hook=settings-links-container] a[href="#${tab}"]`
      $( this.query(selector) ).tab('show')
    }

    this.on('change:current_tab', () => { selectCurrentTab() })

    selectCurrentTab()
  },
  updateState (state) {
    if (!state) { return }
    this.visible = state.visible
    this.current_tab = state.current_tab
  },
  events: {
    'click [data-hook=close-button]': 'onClickCloseButton',
    keydown: 'onKeyEvent',
    keypress: 'onKeyEvent',
    'click .tab-item': 'setCurrentTab'
  },
  onClickCloseButton (event) {
    event.preventDefault()
    event.stopPropagation()
    App.actions.settingsMenu.hide(this.name)
    return false
  },
  onKeyEvent (event) {
    if (event.keyCode === 27) {
      event.preventDefault()
      event.stopPropagation()
      App.actions.settingsMenu.hide(this.name)
      return false
    }
  },
  setCurrentTab (event) {
    App.actions.settingsMenu.toggleTab(this.name, event.target.hash.substring(1))
  }
})
