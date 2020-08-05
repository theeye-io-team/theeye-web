
import App from 'ampersand-app'
import config from 'config'
import View from 'ampersand-view'
import $ from 'jquery'
import MonitorRowView from './monitor'
import IndicatorRowView from './indicator'
import WorkflowsPanelView from './panel/workflow'

import loggerModule from 'lib/logger'; const logger = loggerModule('view:page:dashboard')
import ItemsFolding from './panel-items-fold'

import MonitorsOptions from './monitors-options'
import NotificationsOptions from './notifications-options'
import MonitoringOboardingPanel from './monitoring-onboarding'
import TabsView from './tabs'
import * as TabsConstants from 'constants/tabs'
import InboxView from './inbox'
import SearchResultView from './search-result'

import onBoarding from './onboarding'
import './styles.less'

/**
 *
 * @author Facugon
 * @module DashboardPage
 * @namespace Views
 *
 * @summary page index, main view. all the other views render inside this
 *
 */
export default View.extend({
  autoRender: true,
  template () {
    return pageTemplate()
  },
  props: {
    groupedResources: 'collection',
    indicators: 'collection',
    monitors: 'collection',
    tasks: 'collection',
    upAndRunningSignEnabled: ['boolean', false, () => {
      let enabled = config.dashboard.upandrunningSign
      return typeof enabled === 'boolean' ? enabled : true
    }],
    upAndRunningSignVisible: 'boolean',
    showTasksPanel: ['boolean', false, false],
    failingMonitors: ['array', false, () => { return [] }],
    notifications: 'collection'
  },
  derived: {
    failingMonitorsCount: {
      deps: ['failingMonitors'],
      fn () {
        return this.failingMonitors.length > 0
      }
    }
  },
  bindings: {
    failingMonitorsCount: {
      type: 'toggle',
      hook: 'toggle-up-and-running',
      invert: true
    },
    upAndRunningSignVisible: {
      type: 'booleanClass',
      hook: 'toggle-up-and-running',
      name: 'rotate-90',
      invert: true
    },
    showTasksPanel: {
      type: 'booleanClass',
      hook: 'toggle-hidden-tasks',
      name: 'rotate-90',
    }
  },
  events: {
    'click [data-hook=hide-up-and-running]': 'clickHideUpAndRunningSign',
    'click [data-hook=toggle-up-and-running]': 'clickUpAndRunningSignToggle',
    'click [data-hook=toggle-hidden-tasks]': 'clickTasksPanelToggle'
  },
  clickHideUpAndRunningSign (event) {
    this.upAndRunningSignEnabled = false
    this.hideUpAndRunningSign()
    this.stopListening(
      this,
      'change:failingMonitors',
      this.toggleUpAndRunningSign
    )
  },
  clickUpAndRunningSignToggle (event) {
    event.preventDefault()
    if (this.upAndRunningSignEnabled === true) {
      this.clickHideUpAndRunningSign(event)
    } else {
      this.upAndRunningSignEnabled = true
      this.listenToAndRun(
        this,
        'change:failingMonitors',
        this.toggleUpAndRunningSign
      )
    }
  },
  clickTasksPanelToggle (event) {
    event.preventDefault()
  //  this.tasksFolding.toggleVisibility()
  },
  initialize () {
    View.prototype.initialize.apply(this, arguments)

    this.listenTo(this.monitors, 'sync change:state', () => {
      this.updateFailingMonitors()
    })

    this.tabContentViews = []
  },
  updateFailingMonitors () {
    this.failingMonitors = this.monitors.filter(monitor => {
      let group = this.groupedResources.find(monitor)
      if (!group) { return false }
      return monitor.hasError()
    })
  },
  hideUpAndRunningSign () {
    this.upAndRunningSignVisible = false
    this.$upAndRunningSignEl.slideUp()
    this.$monitorsPanel.slideDown()
  },
  showUpAndRunningSign () {
    this.upAndRunningSignVisible = true
    this.$upAndRunningSignEl.slideDown()
    this.$monitorsPanel.slideUp()
  },
  render () {
    this.renderWithTemplate()

    App.actions.searchbox.emptyRowsViews()

    this.listenToAndRun(App.state.dashboard, 'change:indicatorsDataSynced', () => {
      if (App.state.dashboard.indicatorsDataSynced === true) {
        this.renderIndicatorsPanel()
        this.stopListening(App.state.dashboard, 'change:indicatorsDataSynced')
      }
    })

    this.listenToAndRun(App.state.dashboard, 'change:resourcesDataSynced', () => {
      if (App.state.dashboard.resourcesDataSynced === true) {
        this.updateFailingMonitors()
        this.renderMonitorsPanel()
        this.stopListening(App.state.dashboard, 'change:resourcesDataSynced')
      }
    })

    this.listenToAndRun(App.state.dashboard, 'change:tasksDataSynced', () => {
      if (App.state.dashboard.tasksDataSynced === true) {

        this.renderPanel({
          name: TabsConstants.WORKFLOWS,
          container: this.queryByHook('workflows-tab'),
          view: new WorkflowsPanelView({ collection: this.tasks })
        })

        this.stopListening(App.state.dashboard, 'change:tasksDataSynced')
      }
    })

    this.onBoarding = new onBoarding()

    this.renderSubview(new TabsView(), this.queryByHook('tabs-container'))

    let indicatorsTabView = this.queryByHook('indicators-tabview')
    this.tabContentViews.push({name: TabsConstants.INDICATORS, view: indicatorsTabView})

    let monitorsTabView = this.queryByHook('monitors-tabview')
    this.tabContentViews.push({name: TabsConstants.MONITORS, view: monitorsTabView})

    let notificationsTabView = this.queryByHook('notifications-tabview')
    this.tabContentViews.push({name: TabsConstants.NOTIFICATIONS, view: notificationsTabView})

    this.listenToAndRun(App.state.tabs, 'change:currentTab', () => {
      for (const contentView of this.tabContentViews) {
        if (contentView.name === App.state.tabs.currentTab) {
          contentView.view.style.display = 'block'
        } else {
          contentView.view.style.display = 'none'
        }
      }
    })

    this.renderNotificationsPanel()
    this.renderSearchResultView()

    document.getElementsByClassName('navbar')[0].style.display = 'block'
  },
  renderPanel ({ name, container, view }) {
    this.renderSubview(view, container)
    this.tabContentViews.push({ name, view: view.el })
  },
  toggleUpAndRunningSign () {
    // upandrunning is disabled
    if (this.upAndRunningSignEnabled === false) { return }
    if (this.monitors.length === 0) { return }
    const failing = this.failingMonitors
    if (failing.length > 0) {
      this.hideUpAndRunningSign()
    } else {
      this.showUpAndRunningSign()
    }
  },
  sortGroupedResouces () {
    if (!(this.groupedResources.length > 0)) return

    const failing = this.failingMonitors

    /** move ok monitors to fold container **/
    const foldMonitors = () => {
      this.monitorRows.views.forEach(view => {
        let model = view.model
        if (!model.hasError()) {
          this.monitorsFolding.append(view.el)
        } else {
          this.$monitorsPanel.prepend(view.el)
        }
      })
    }

    /** restore to default **/
    const unfoldMonitors = () => {
      this.monitorRows.views.forEach(view => {
        this.$monitorsPanel.append(view.el)
      })
    }

    if (failing.length > 0) {
      foldMonitors()
      this.monitorsFolding.showButton()
    } else {
      unfoldMonitors()
      this.monitorsFolding.hideButton()
    }
  },
  /**
   *
   * should be converted into a Monitors Panel View
   *
   */
  renderMonitorsPanel () {
    this.$upAndRunningSignEl = $(this.queryByHook('hide-up-and-running'))
    this.$monitorsPanel = $(this.queryByHook('monitors-container'))

    this.renderSubview(
      new MonitorsOptions(),
      this.queryByHook('monitors-panel-header')
    )

    this.monitorRows = this.renderCollection(
      this.groupedResources,
      MonitorRowView,
      this.queryByHook('monitors-container'),
      {
        emptyView: MonitoringOboardingPanel
      }
    )

    const rowtooltips = this.query('[data-hook=monitors-container] .tooltiped')
    $(rowtooltips).tooltip()

    this.monitorsFolding = this.renderSubview(
      new ItemsFolding({}),
      this.queryByHook('monitors-fold-container')
    )

    this.listenToOnce(App.state.onboarding, 'first-host-registered', () => {
      App.actions.tabs.setCurrentTab(TabsConstants.WORKFLOWS)
      this.onBoarding.onboardingStart()
    })

    this.listenToAndRun(App.state.dashboard.groupedResources, 'add change sync reset', () => {
      var monitorOptionsElem = this.queryByHook('monitor-options')
      if (App.state.dashboard.groupedResources.length > 0) {
        if (monitorOptionsElem) {
          monitorOptionsElem.style.visibility = ''
        }
        if (this.monitorsFolding) {
          this.monitorsFolding.showButton()
        }
      } else {
        if (monitorOptionsElem) {
          monitorOptionsElem.style.visibility = 'hidden'
        }
        if (this.monitorsFolding) {
          this.monitorsFolding.hideButton()
        }
      }
      this.sortGroupedResouces()
    })

    this.listenTo(
      this,
      'change:failingMonitors',
      this.toggleUpAndRunningSign
    )

    this.listenTo(this.monitors, 'add', () => {
      this.monitorsFolding.unfold()
      App.state.dashboard.groupResources()
    })

    App.actions.searchbox.addRowsViews(this.monitorRows.views)
  },
  renderIndicatorsPanel () {
    this.indicatorsRows = this.renderCollection(
      this.indicators,
      IndicatorRowView,
      this.queryByHook('indicators-container'),
      {
        emptyView: EmptyIndicatorsView
      }
    )

    App.actions.searchbox.addRowsViews(this.indicatorsRows.views)
  },
  renderNotificationsPanel () {
    this.inbox = new InboxView({collection: this.notifications})
    this.renderSubview(
      this.inbox,
      this.queryByHook('notifications-container')
    )

    this.renderSubview(
      new NotificationsOptions(),
      this.queryByHook('notifications-panel-header')
    )
  },
  renderSearchResultView () {
    this.renderSubview(new SearchResultView())
  }
})

const EmptyIndicatorsView = View.extend({
  template: `<div>No Indicators</div>`
})

const pageTemplate = () => {
  let html = `
    <div data-component="dashboard-page" class="admin-container dashboard">
      <div data-hook="tabs-container">
      </div>
      <!-- INDICATORS -->
      <div data-hook="indicators-tabview">
        <div data-hook="indicators-panel">
          <section class="col-md-12 indicators-panel events-panel">
            <div class="section-header">
            </div>
            <div class="section-container">
              <div class="panel-group" id="indicators-accordion" role="tablist" aria-multiselectable="true">
                <section data-hook="indicators-container"> </section>
              </div>
            </div>
          </section>
        </div>
      </div>
      <!-- /INDICATORS -->

      <!-- MONITORS -->
      <div data-hook="monitors-tabview">
        <div data-hook="monitors-panel" class="monitors admin-panel">
          <section class="col-md-12 resources-panel events-panel">
            <div class="section-header">
              <div data-hook="monitors-panel-header" class="options-container">
                <a data-hook="toggle-up-and-running" href="#" class="fa fa-chevron-right rotate section-toggle"></a>
              </div>
            </div>


            <!-- HIDDEN CONTAINER WITH EXTRA OPTIONS -->
            <div data-hook="more-options" class="group hidden-container">
              <div data-hook="grouping-select"></div>
            </div>

            <!-- ALL UP AND RUNNING -->
            <div data-hook="hide-up-and-running" class="main-status hidden-container">
              <i class="fa fa-check-circle big-icon"></i>
              <h4>Relax, Nothing to worry about</h4>
              <span>Click to see more</span>
            </div>

            <!-- MONITORS LIST -->
            <div class="section-container">
              <div class="panel-group" id="monitor-accordion" role="tablist" aria-multiselectable="true">
                <section data-hook="monitors-container">
                  <!-- MONITOR CONTAINER -->
                </section>
                <section data-hook="monitors-fold-container">
                </section>
              </div>
            </div>
          </section>
        </div>
      </div>
      <!-- /MONITORS -->

      <!-- WORKFLOWS -->
      <div data-hook="workflows-tab"> </div>
      <!-- /WORKFLOWS -->
      <!-- NOTIFICATIONS -->
      <div data-hook="notifications-tabview">
        <div data-hook="notifications-panel">
          <section class="col-md-12 notifications-panel events-panel">
            <div class="section-header">
              <div data-hook="notifications-panel-header" class="options-container">
              </div>
            </div>
            <div class="section-container">
              <div class="panel-group" id="notifications-accordion" role="tablist" aria-multiselectable="true">
                <section data-hook="notifications-container"> </section>
              </div>
            </div>
          </section>
        </div>
      </div>
      <!-- /NOTIFICATIONS -->
      <div data-hook="result-view"></div>
    </div>
  `
  return html
}
