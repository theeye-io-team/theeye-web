import View from 'ampersand-view'
import App from 'ampersand-app'
import './styles.less'

export default View.extend({
  template: `<div data-component="dashboard-tabs" class="dashboard-tabs"> </div>`,
  render () {
    this.renderWithTemplate(this)
    const tabsViews = this.renderCollection(
      App.state.tabs.tabs,
      TabButton,
      this.query('.dashboard-tabs')
    )

    //const tabsViews = this.queryAll('.dashboard-tab')
    //for (const tabView of tabsViews) {
    //  tabView.style.width = '25%'
    //}
  }
})

const TabButton = View.extend({
  template: `
    <div class="dashboard-tab" style="width: 25%">
      <span data-hook="name"></span>
      <span data-hook="showBadge" class="has-notification"></span>
    </div>
  `,
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
