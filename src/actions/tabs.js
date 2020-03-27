import App from 'ampersand-app'

module.exports = {
  setCurrentTab (tabName) {
    for (const tab of App.state.tabs.tabs.models) {
      if (tab.name === tabName) {
        tab.active = true
        tab.showBadge = false
      } else {
        tab.active = false
      }
    }

    App.state.tabs.currentTab = tabName
  },
  showNotification (tabName) {
    for (const tab of App.state.tabs.tabs.models) {
      if (tab.name === tabName && !tab.active) {
        tab.showBadge = true
      }
    }
  }
}
