'use strict'

import App from 'ampersand-app'
import config from 'config'
import View from 'ampersand-view'
import $ from 'jquery'
import StatsPanelView from './stats-panel'
import TaskRowView from './task'
import MonitorRowView from './monitor'
import IndicatorRowView from './indicator'
import RunAllTasksButton from './task/run-all-button'
import TaskActions from 'actions/task'
import WorkflowActions from 'actions/workflow'
import bootbox from 'bootbox'

const logger = require('lib/logger')('view:page:dashboard')
const ItemsFolding = require('./panel-items-fold')
const searchRows = require('lib/filter-rows')

import MonitorsOptions from './monitors-options'
import MonitoringOboardingPanel from './monitoring-onboarding'
import TasksOboardingPanel from './tasks-onboarding'
import PlusMenuButton from './plus-menu-button'
import acls from 'lib/acls'

import onBoarding from './onboarding'

/**
 *
 * @author Facugon
 * @module DashboardPage
 * @namespace Views
 *
 * @summary page index, main view. all the other views render inside this
 *
 */
module.exports = View.extend({
  autoRender: true,
  template: require('./page.hbs'),
  props: {
    groupedResources: 'collection',
    indicators: 'collection',
    monitors: 'collection',
    tasks: 'collection',
    renderStats: ['boolean', false, false],
    renderTasks: ['boolean', false, true],
    upAndRunningSignEnabled: ['boolean', false, () => {
      let enabled = config.dashboard.upandrunningSign
      return typeof enabled === 'boolean' ? enabled : true
    }],
    upAndRunningSignVisible: 'boolean',
    failingMonitors: ['array', false, () => { return [] }]
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
      name: 'rotate-180'
    }
  },
  events: {
    'click [data-hook=hide-up-and-running]': 'clickHideUpAndRunningSign',
    'click [data-hook=toggle-up-and-running]': 'clickUpAndRunningSignToggle',
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
  initialize () {
    View.prototype.initialize.apply(this, arguments)

    this.listenTo(this.monitors, 'sync change:state', () => {
      this.updateFailingMonitors()
    })
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

    if (this.renderTasks === true) {
      this.listenToAndRun(App.state.dashboard, 'change:tasksDataSynced', () => {
        if (App.state.dashboard.tasksDataSynced === true) {
          this.renderTasksPanel()
          this.stopListening(App.state.dashboard, 'change:tasksDataSynced')
        }
      })
    } else {
      // remove panel container
      this.queryByHook('tasks-panel').remove()
    }

    if (this.renderStats === true) {
      this.renderSubview(
        new StatsPanelView(),
        this.queryByHook('.admin-container.dashboard')
      )
    }

    this.onBoarding = new onBoarding()

    if (acls.hasAccessLevel('admin')) {
      this.renderPlusButton()
    }

    document.getElementsByClassName('navbar')[0].style.display = 'block'
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

    /** bind searchbox **/
    this.listenToAndRun(App.state.searchbox, 'change:search', () => {
      if (this.monitorRows) {
        searchRows({
          rows: this.monitorRows.views,
          search: App.state.searchbox.search,
          onrow: (row, hit) => {
            row.show = Boolean(hit)
          },
          onsearchend: () => {
            this.monitorRows.views.forEach(row => row.show = true)
          }
        })
      }
      if (App.state.searchbox.search) {
        this.hideUpAndRunningSign()
        this.monitorsFolding.unfold()
      } else {
        this.monitorsFolding.fold()
        this.toggleUpAndRunningSign()
      }
    })

    this.listenToOnce(App.state.onboarding, 'first-host-registered', () => {
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
  },
  renderIndicatorsPanel () {
    let indicatorsContainer = this.queryByHook('indicators-panel')

    this.listenToAndRun(this.indicators, 'add remove', () => {
      if (this.indicators.length===0) {
        indicatorsContainer.style.display = 'none'
      } else {
        indicatorsContainer.style.display = 'block'
      }
    })

    this.indicatorsRows = this.renderCollection(
      this.indicators,
      IndicatorRowView,
      this.queryByHook('indicators-container'),
      {
        emptyView: EmptyIndicatorsView
      }
    )

    const search = () => { }

    this.listenToAndRun(App.state.searchbox, 'change:search', search)
  },
  /**
   *
   * should be converted into a Tasks Panel View
   *
   */
  renderTasksPanel () {
    const taskRows = this.renderCollection(
      this.tasks,
      TaskRowView,
      this.queryByHook('tasks-container'),
      {
        emptyView: TasksOboardingPanel
      }
    )

    const runAllButton = new RunAllTasksButton({
      el: this.queryByHook('run-all-tasks')
    })
    runAllButton.render()
    this.registerSubview(runAllButton)

    this.listenTo(runAllButton, 'runall', () => {
      const rows = taskRows.views.filter(row => {
        return row.model.canExecute && row.show === true
      })
      runAllTasks(rows)
    })

    const rowtooltips = this.query('[data-hook=tasks-container] .tooltiped')
    $(rowtooltips).tooltip()

    this.tasksFolding = this.renderSubview(
      new ItemsFolding({}),
      this.queryByHook('tasks-fold-container')
    )

    taskRows.views.forEach(row => {
      let task = row.model
      if (!task.canExecute) {
        this.tasksFolding.append(row.el)
      }
    })

    this.listenToAndRun(App.state.tasks, 'add sync reset', () => {
      if (this.tasksFolding) {
        if (App.state.tasks.length > 0) {
          this.tasksFolding.showButton()
        } else {
          this.tasksFolding.hideButton()
        }
      }
    })

    const search = () => {
      if (taskRows) {
        searchRows({
          rows: taskRows.views,
          search: App.state.searchbox.search,
          onrow: (row, isHit) => {
            if (row.model.canExecute) {
              row.show = isHit
            } else {
              row.show = false
            }
          },
          onsearchend: () => {
            taskRows.views.forEach(row => row.show = true)
          }
        })

        runAllButton.visible = Boolean(App.state.searchbox.search)

        if (App.state.searchbox.search.length > 3) {
          const rows = taskRows.views.filter(row => row.show === true)
          if (!rows || rows.length === 0) {
            // no rows to show
            runAllButton.disabled = true
          } else {
            // verify if all the tasks are not being executed
            const nonExecutableTasks = rows
              .map(row => row.model)
              .find(task => {
                if (/Task/.test(task._type)) {
                  return !task.canBatchExecute
                }
                if (/Workflow/.test(task._type)) {
                  var WFNotExecutable = false
                  task.tasks.models.forEach(function (wfTask) {
                    if (!wfTask.canBatchExecute) {
                      WFNotExecutable = true
                    }
                  })
                  return WFNotExecutable
                }
              })

            runAllButton.disabled = (nonExecutableTasks !== undefined)
          }
        } else {
          runAllButton.disabled = true
        }
      }
    }

    this.listenToAndRun(App.state.searchbox, 'change:search', search)
  },
  renderPlusButton () {
    this.plusButton = new PlusMenuButton()
    this.renderSubview(this.plusButton)
  }
})

const runAllTasks = (rows) => {
  // doble check here
  if (rows.length > 0) {
    const tasks = rows.map(row => row.model)

    const boxTitle = `With great power comes great responsibility`
    const boxMessage = `You are going to run various tasks.<br> This operation cannot be canceled`

    bootbox.confirm({
      title: boxTitle,
      message: boxMessage,
      backdrop: true,
      buttons: {
        confirm: {
          label: 'Run All',
          className: 'btn-danger'
        },
        cancel: {
          label: 'Maybe another time...',
          className: 'btn-default'
        }
      },
      callback (confirmed) {
        if (confirmed === true) {

          tasks.forEach(task => {
            if (/Workflow/.test(task._type)) {
              WorkflowActions.triggerExecution(task)
            } else {
              TaskActions.execute(task)
            }
          })
        }
      }
    })
  }
}

const EmptyIndicatorsView = View.extend({
  template: `<div>No Indicators</div>` 
})
