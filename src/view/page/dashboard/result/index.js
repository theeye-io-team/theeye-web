import App from 'ampersand-app'
import FullContainer from 'components/fullpagecontainer'
import ResultMain from './result'
import SearchboxActions from 'actions/searchbox'

import './styles.less'

export default FullContainer.extend({
  template: `<div data-component="result-container" class="full-page-container"></div>`,
  autoRender: true,
  props: {
    visible: ['boolean',false,false],
    menu_switch: ['boolean', false, false],
  },
  bindings: {
    visible: { type: 'toggle' },
    menu_switch: [{
      type: 'booleanClass',
      no: 'page-container-contract',
      yes: 'page-container-expand'
    }]
  },
  initialize () {
    FullContainer.prototype.initialize.apply(this,arguments)

    this.autoAppend = true
    this.content = new ResultMain()

    this.listenToAndRun(App.state.searchbox,'change',() => {
      this.updateState(App.state.searchbox)
    })

    this.listenToAndRun(App.state.navbar, 'change:menuSwitch', () => {
      this.menu_switch = App.state.navbar.menuSwitch
    })

    this.on('change:visible', () => {
      if (this.visible===true) {
        window.scrollTo(0,0)
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = 'auto'
      }
    })
  },
  render () {
    FullContainer.prototype.render.apply(this,arguments)
  },
  updateState (state) {
    if (!state) return

    if (state.search === '') {
      SearchboxActions.clearResults()
      this.visible = false
    } else {
      this.visible = true
    }
  }
})
