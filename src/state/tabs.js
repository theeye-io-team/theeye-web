import App from 'ampersand-app'
import State from 'ampersand-state'
import { Model as Tab, Collection as Tabs } from 'models/tab'
import * as TabsConstants from 'constants/tabs'
import loggerModule from 'lib/logger'; const logger = loggerModule('state:tabs')

export default State.extend({
  props: {
    currentTab: ['string', false, '']
  },
  collections: {
    tabs: Tabs
  },
  initialize () {
    this.addTab(TabsConstants.WORKFLOWS)
    this.addTab(TabsConstants.INDICATORS)
    this.addTab(TabsConstants.MONITORS)
    this.addTab(TabsConstants.NOTIFICATIONS)

    this.listenToAndRun(App.state.dashboard, 'change:dataSynced', () => {
      if (App.state.dashboard.dataSynced) {
        this.resetActiveTab()
        this.stopListening(App.state.dashboard, 'change:dataSynced')
      }
    })

    this.listenTo(this.tabs, 'change:show', (tab) => {
      logger.log(`${tab.name} show changed to ${tab.show}`)
      if (tab.active === true && tab.show === false) {
        this.resetActiveTab()
      }
    })
  },
  resetActiveTab () {
    const aVisibleTab = this.tabs.find(tab => tab.show === true)
    if (!aVisibleTab) {
      logger.log(`Cannot activate any tab`)
      return
    }
    App.actions.tabs.setCurrentTab(aVisibleTab.name)
    logger.log(`Active tab ${aVisibleTab.name}`)
  },
  addTab (name) {
    const tab = new Tab({ name })
    this.tabs.add(tab)

    let collectionName
    let propName
    if (name === TabsConstants.MONITORS) {
      collectionName = 'resources'
      propName = `${collectionName}DataSynced`
    } else if (name === TabsConstants.WORKFLOWS) {
      collectionName = TabsConstants.WORKFLOWS
      propName = `tasksDataSynced`
    } else {
      collectionName = name
      propName = `${name}DataSynced`
    }

    const collection = App.state[collectionName]

    if (name === TabsConstants.NOTIFICATIONS) {
      tab.show = false
    } else {
      this.listenToAndRun(App.state.dashboard, `change:${propName}`, () => {
        if (App.state.dashboard[propName]) {
          tab.show = (collection.length > 0)
          this.stopListening(App.state.dashboard, `change:${propName}`)
        }
      })
    }

    this.listenToAndRun(collection, 'add', () => {
      if (collection.length > 0 && tab.show === false) {
        tab.show = true
      } else if (collection.length === 0 && tab.show === true) {
        tab.show = false
      }
    })
  },
})
