import App from 'ampersand-app'
import FullContainer from 'components/fullpagecontainer'
import html2dom from 'lib/html2dom'

import TasksTab from './tasks'

import './style.less'

export default FullContainer.extend({
  template: `
    <div data-component="marketplace-container" class="full-page-container">
      <div class="marketplace-page">
        <div class="header text-center">
          <span>TheEye Marketplace</span>
          <span data-hook="close-button" class="close-button fa fa-remove" style=""></span>
        </div>
        <div class="col-xs-3 panel-left">
          <ul class="nav nav-tabs tabs-left" data-hook="marketplace-links-container">
          </ul>
        </div>
        <div class="col-xs-9 panel-right">
          <div class="tab-content" data-hook="panes-container">
            <div class="tab-pane fade" id="tasks" data-hook="tasks-tab"></div>
            <div class="tab-pane fade" id="workflows" data-hook="workflows-tab"></div>
            <div class="tab-pane fade" id="monitors" data-hook="monitors-tab"></div>
            <div class="tab-pane fade" id="indicators" data-hook="indicators-tab"></div>
          </div>
        </div>
      </div>
    </div>
  `,
  autoRender: true,
  props: {
    visible: ['boolean',false,false],
    current_tab: 'string'
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
      console.log({ visible: this.visible })
      if (this.visible === true) {
        window.scrollTo(0,0)
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = 'auto'
      }
    })

    this.renderTabs()
    
    this.listenToAndRun(App.state.marketplace, 'change', () => {
      this.updateState(App.state.marketplace)
    })
  },
  renderTabs() {
    const links = this.queryByHook('marketplace-links-container')
    
    links.appendChild( html2dom(`<li class="tab-item"><a href="#tasks" data-toggle="tab">Tasks</a></li>`))
    const tasksTab = new TasksTab()
    this.renderSubview(tasksTab, this.queryByHook('tasks-tab'))

    links.appendChild( html2dom(`<li class="tab-item"><a href="#workflows" data-toggle="tab">Workflows</a></li>`))
    links.appendChild( html2dom(`<li class="tab-item"><a href="#monitors" data-toggle="tab">Monitors</a></li>`))
    links.appendChild( html2dom(`<li class="tab-item"><a href="#indicators" data-toggle="tab">Indicators</a></li>`))
  },
  updateState (state) {
    if (!state) { return }
    this.visible = state.menu.visible
    this.current_tab = state.menu.current_tab
    const selector = `[data-hook=marketplace-links-container] a[href="#${this.current_tab}"]`
    $( this.query(selector) ).tab('show')
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
    App.actions.marketplace.menu.hide()
    return false
  },
  onKeyEvent (event) {
    if (event.keyCode === 27) {
      event.preventDefault()
      event.stopPropagation()
      App.actions.marketplace.menu.hide()
      return false
    }
  },
  setCurrentTab (event) {
    App.actions.marketplace.menu.toggleTab(event.target.hash.substring(1))
  }
})
