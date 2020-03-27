import App from 'ampersand-app'
import State from 'ampersand-state'
import { Model as Tab, Collection as Tabs } from 'models/tab'
import TabsConstants from 'constants/tabs'

export default State.extend({
  props: {
    currentTab: ['string', false, '']
  },
  collections: {
    tabs: Tabs
  },
  initialize () {
    let tabs = {
      indicators: new Tab({name: TabsConstants.INDICATORS}),
      monitors: new Tab({name: TabsConstants.MONITORS}),
      workflows: new Tab({name: TabsConstants.WORKFLOWS}),
      notifications: new Tab({name: TabsConstants.NOTIFICATIONS})
    }

    for (let tab in tabs) { this.tabs.add(tabs[tab]) }

    this.listenToAndRun(App.state.dashboard, 'change:indicatorsDataSynced', () => {
      if (App.state.dashboard.indicatorsDataSynced) {
        tabs.indicators.show = App.state.indicators.length > 0
        this.stopListening(App.state.dashboard, 'change:indicatorsDataSynced')
      }
    })

    this.listenToAndRun(App.state.indicators, 'add', () => {
      tabs.indicators.show = true
    })

    // this.listenToAndRun(App.state.dashboard, 'change:resourcesDataSynced', () => {
    //   if (App.state.dashboard.resourcesDataSynced) {
    //     tabs.monitors.show = App.state.resources.length > 0
    //     this.stopListening(App.state.dashboard, 'change:resourcesDataSynced')
    //   }
    // })
    //
    // this.listenToAndRun(App.state.dashboard, 'change:tasksDataSynced', () => {
    //   if (App.state.dashboard.tasksDataSynced) {
    //     tabs.workflows.show = App.state.tasks.length > 0
    //     this.stopListening(App.state.dashboard, 'change:tasksDataSynced')
    //   }
    // })

    this.listenToAndRun(App.state.dashboard, 'change:dataSynced', () => {
      if (App.state.dashboard.dataSynced) {
        this.setActiveTab()
        this.stopListening(App.state.dashboard, 'change:dataSynced')
      }
    })
  },
  setActiveTab () {
    var firstTab = App.state.tabs.tabs.find(function (tab) {
      return tab.show
    })
    App.actions.tabs.setCurrentTab(firstTab.name)
  }
})
