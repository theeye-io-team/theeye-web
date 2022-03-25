import App from 'ampersand-app'
import State from 'ampersand-state'
import Collection from 'ampersand-collection'
import * as TabsConstants from 'constants/tabs'
import loggerModule from 'lib/logger'; const logger = loggerModule('state:tabs')

const Tab = State.extend({
  props: {
    name: 'string',
    show: ['boolean', false, false],
    active: ['boolean', false, false],
    showBadge: ['boolean', false, false]
  }
})

const Tabs = Collection.extend({ model: Tab })

export default State.extend({
  props: {
    currentTab: ['string', false, '']
  },
  collections: {
    tabs: Tabs
  },
  initialize () {
    this.addWorkflowsTab()
    this.addIndicatorsTab()
    this.addMonitorsTab()
    this.addNotificationsTab()

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
    const aVisibleTab = this.tabs.models.find(tab => tab.show === true)
    if (!aVisibleTab) {
      logger.log(`Cannot activate any tab`)
      return
    }
    App.actions.tabs.setCurrentTab(aVisibleTab.name)
    logger.log(`Active tab ${aVisibleTab.name}`)
  },
  //addWorkflowsTab () {
  //  const name = TabsConstants.WORKFLOWS
  //  const tab = new Tab({ name })
  //  this.tabs.add(tab)

  //  const tasks = App.state.tasks
  //  const workflows = App.state.workflows

  //  this.listenToAndRun(App.state.dashboard, 'change:tasksDataSynced', () => {
  //    if (App.state.dashboard.tasksDataSynced) {
  //      tab.show = (workflows.length > 0 || tasks.length > 0)
  //      this.stopListening(App.state.dashboard, 'change:tasksDataSynced')
  //    }
  //  })

  //  const onElementAdded = () => {
  //    if (
  //      (workflows.length > 0 || tasks.length > 0) &&
  //      tab.show === false
  //    ) {
  //      tab.show = true
  //    } else if (
  //      workflows.length === 0 &&
  //      tasks.length === 0 &&
  //      tab.show === true
  //    ) { 
  //      tab.show = false
  //    }
  //  }

  //  this.listenToAndRun(workflows, 'add remove reset', onElementAdded)
  //  this.listenToAndRun(tasks, 'add remove reset', onElementAdded)
  //},
  addWorkflowsTab () {
    const name = TabsConstants.WORKFLOWS
    const tab = new Tab({ name })
    this.tabs.add(tab)

    const tasks = App.state.tasks

    this.listenToAndRun(App.state.dashboard, 'change:tasksDataSynced', () => {
      if (App.state.dashboard.tasksDataSynced) {
        tab.show = tasks.length > 0
        this.stopListening(App.state.dashboard, 'change:tasksDataSynced')
      }
    })

    const onElementAdded = () => {
      if (tasks.length > 0 && tab.show === false) {
        tab.show = true
      } else if (tasks.length === 0 && tab.show === true) { 
        tab.show = false
      }
    }

    this.listenToAndRun(tasks, 'add remove reset', onElementAdded)
  },
  addIndicatorsTab () {
    const tab = new Tab({ name: TabsConstants.INDICATORS })
    this.tabs.add(tab)

    const propName = 'indicatorsDataSynced'
    const collection = App.state.indicators

    this.listenToAndRun(App.state.dashboard, `change:${propName}`, () => {
      if (App.state.dashboard[propName]) {
        tab.show = (collection.length > 0)
        this.stopListening(App.state.dashboard, `change:${propName}`)
      }
    })

    this.listenToAndRun(collection, 'add remove reset', () => {
      if (collection.length > 0 && tab.show === false) {
        tab.show = true
      } else if (collection.length === 0 && tab.show === true) {
        tab.show = false
      }
    })
  },
  addMonitorsTab () {
    const tab = new Tab({ name: TabsConstants.MONITORS })
    this.tabs.add(tab)

    const propName= 'resourcesDataSynced'
    const collection = App.state.resources

    this.listenToAndRun(App.state.dashboard, `change:${propName}`, () => {
      if (App.state.dashboard[propName]) {
        tab.show = (collection.length > 0)
        this.stopListening(App.state.dashboard, `change:${propName}`)
      }
    })

    this.listenToAndRun(collection, 'add remove reset', () => {
      if (collection.length > 0 && tab.show === false) {
        tab.show = true
      } else if (collection.length === 0 && tab.show === true) {
        tab.show = false
      }
    })
  },
  addNotificationsTab () {
    const tab = new Tab({ name: TabsConstants.NOTIFICATIONS })
    this.tabs.add(tab)

    const collection = App.state.notifications
    tab.show = false

    this.listenToAndRun(collection, 'add remove reset', () => {
      if (collection.length > 0 && tab.show === false) {
        tab.show = true
      } else if (collection.length === 0 && tab.show === true) {
        tab.show = false
      }
    })
  }
})
