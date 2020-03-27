import View from 'ampersand-view'
import App from 'ampersand-app'
import './styles.less'

const TabButton = View.extend({
  template: `
    <div class="dashboard-tab">
      <span data-hook="name"></span>
      <span data-hook="showBadge" class="has-notification"></span>
    </div>`,
  bindings: {
    'model.name': { hook: 'name' },
    'model.active': {
      type: 'booleanClass',
      selector: '.dashboard-tab',
      name: 'active'
    },
    'model.showBadge': {
      type: 'toggle',
      hook: 'showBadge'
    },
    'model.show': {
      type: 'toggle'
    }
  },
  events: {
    'click': 'setActive'
  },
  setActive (event) {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    App.actions.tabs.setCurrentTab(this.model.name)
  }
})

module.exports = View.extend({
  template: `
    <div class="dashboard-tabs">
    </div>`,
  initialize () {
    View.prototype.initialize.apply(this, arguments)
  },
  render () {
    this.renderWithTemplate(this)
    this.renderTabs()
  },
  renderTabs () {
    this.renderCollection(App.state.tabs.tabs, TabButton, this.query('.dashboard-tabs'))
    this.setTabsWidth()
  },
  setTabsWidth () {
    const tabsViews = this.queryAll('.dashboard-tab')
    for (const tabView of tabsViews) {
      tabView.style.width = '25%'
    }
  }
})
