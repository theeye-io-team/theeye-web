import App from 'ampersand-app'
import View from 'ampersand-view'
import Backdrop from 'components/backdrop'
import NavbarActions from 'actions/navbar'
import TaskCreationWizard from 'view/page/task/creation-wizard'
import MonitorCreationWizard from 'view/page/monitor/creation-wizard'
import WorkflowCreationWizard from 'view/page/workflow/creation-wizard'
import IndicatorCreationWizard from 'view/page/indicator/creation-wizard'
import WebhookCreationWizard from 'view/page/webhook/creation-wizard'
import FileCreationWizard from 'view/page/files/creation-wizard'
import MarketplaceView from 'view/marketplace'

import './style.less'

export default View.extend({
  template: `
    <div class="plus-menu-button eyemenu-panel-launcher pull-left">
      <i data-hook="plus-menu-toggle" class="fa fa-plus-circle"></i>
      <div class="plus-menu-popup" data-hook="plus-menu-popup">
        <ul class="plus-menu-links">
          <li><a data-hook="create-task" href="#" class="plus-menu-icon fa-play">Task</a></li>
          <li><a data-hook="create-monitor" href="#" class="plus-menu-icon fa-desktop">Monitor</a></li>
          <li><a data-hook="create-workflow" href="#" class="plus-menu-icon fa-sitemap">Workflow</a></li>
          <li><a data-hook="create-indicator" href="#" class="plus-menu-icon fa-lightbulb-o">Indicator</a></li>
          <li><a data-hook="create-webhook" href="#" class="plus-menu-icon eyeicon eyeicon-webhooks">Webhook</a></li>
          <li><a data-hook="create-file" href="#" class="plus-menu-icon eyeicon eyeicon-scripts">File</a></li>
          <li><a data-hook="open-marketplace" href="#" class="plus-menu-icon eyeicon eyeicon-marketplace">Marketplace</a></li>
        </ul>
      </div>
    </div>`,
  props: {
    open: ['boolean', false, false]
  },
  bindings: {
    open: {
      type: 'toggle',
      hook: 'plus-menu-popup'
    }
  },
  events: {
    'click [data-hook=plus-menu-toggle]': function (event) {
      event.preventDefault()
      event.stopPropagation()
      NavbarActions.togglePlusMenu()
      return false
    },
    'click a[data-hook=create-task]': function (event) {
      event.preventDefault()
      event.stopPropagation()
      NavbarActions.togglePlusMenu()
      let wizard = new TaskCreationWizard()
      return false
    },
    'click a[data-hook=create-monitor]': function (event) {
      event.preventDefault()
      event.stopPropagation()
      NavbarActions.togglePlusMenu()
      let wizard = new MonitorCreationWizard()
      return false
    },
    'click a[data-hook=create-workflow]': function (event) {
      event.preventDefault()
      event.stopPropagation()
      NavbarActions.togglePlusMenu()
      let wizard = new WorkflowCreationWizard()
      return false
    },
    'click a[data-hook=create-indicator]': function (event) {
      event.preventDefault()
      event.stopPropagation()
      NavbarActions.togglePlusMenu()
      let wizard = new IndicatorCreationWizard()
      return false
    },
    'click a[data-hook=create-webhook]': function (event) {
      event.preventDefault()
      event.stopPropagation()
      NavbarActions.togglePlusMenu()
      let wizard = new WebhookCreationWizard()
      return false
    },
    'click a[data-hook=create-file]': function (event) {
      event.preventDefault()
      event.stopPropagation()
      NavbarActions.togglePlusMenu()
      let wizard = new FileCreationWizard()
      return false
    },
    'click a[data-hook=open-marketplace]': function (event) {
      event.preventDefault()
      event.stopPropagation()
      NavbarActions.togglePlusMenu()
      App.actions.marketplace.menu.show()
      return false
    }
  },
  initialize () {
    this.listenToAndRun(App.state.navbar, 'change:plusMenuSwitch', () => {
      this.open = App.state.navbar.plusMenuSwitch
    })
  },
  render () {
    this.renderWithTemplate(this)
    this.registerSubview(new MarketplaceView())
    this.renderBackdrop()
  },
  renderBackdrop () {
    const backdrop = new Backdrop({
      zIndex: 1029,
      opacity: 0
    })
    backdrop.onClick = (event) => {
      event.preventDefault()
      event.stopPropagation()
      NavbarActions.togglePlusMenu()
      return false
    }
    this.on('change:open', () => {
      backdrop.visible = this.open
    })
  }
})
