'use strict';

import App from 'ampersand-app'
import config from 'config'
import View from 'ampersand-view'
import $ from 'jquery'
import StatsPanelView from './stats-panel'
import TaskRowView from './task'
import MonitorRowView from './monitor'
import RunAllTasksButton from './task/run-all-button'
import JobActions from 'actions/job'
import bootbox from 'bootbox'
import LIFECYCLE from 'constants/lifecycle'

const logger = require('lib/logger')('view:page:dashboard')
const ItemsFolding = require('./panel-items-fold')
const searchRows = require('lib/filter-rows')

import MonitorsOptions from './monitors-options'
import MonitoringOboardingPanel from './monitoring-onboarding'
import TasksOboardingPanel from './tasks-onboarding'

import onBoarding from './onboarding'

const runAllTasks = (rows) => {
  // doble check here
  if (rows.length>0) {
    const tasks = rows.map(row => row.model)

    const boxTitle = `With great power comes great responsibility`
		const boxMessage = `You are going to run all the following tasks.<br> This operation cannot be canceled`

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
				if (confirmed===true) {
          tasks.forEach(task => JobActions.create(task))
				}
			}
		})
  }
}

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
    monitors: 'collection',
    tasks: 'collection',
    renderStats: ['boolean',false,false],
    renderTasks: ['boolean',false,true],
    waitTimeout: ['number',false,null],
    upandrunningSign: ['boolean',false,() => {
      let enabled = config.dashboard.upandrunningSign
      return typeof enabled === 'boolean' ? enabled : true
    }]
  },
  events: {
    'click [data-hook=up-and-running] i':'hideUpAndRunning',
  },
  initialize () {
    View.prototype.initialize.apply(this,arguments)
  },
  hideUpAndRunning () {
    this.$upandrunning.slideUp()
    this.$monitorsPanel.slideDown()
    this.upandrunningSign = false
  },
  render () {
    this.renderWithTemplate()

    this.listenToAndRun(App.state.dashboard,'change:resourcesDataSynced',() => {
      if (App.state.dashboard.resourcesDataSynced===true) {
        this.renderMonitorsPanel()
        this.stopListening(App.state.dashboard,'change:resourcesDataSynced')
      }
    })

    if (this.renderTasks === true) {
      this.listenToAndRun(App.state.dashboard,'change:tasksDataSynced',() => {
        if (App.state.dashboard.tasksDataSynced===true) {
          this.renderTasksPanel()
          this.stopListening(App.state.dashboard,'change:tasksDataSynced')
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
  },
  setUpAndRunningSign: function () {
    if (!this.upandrunningSign) return // upandrunning is disabled
    if (this.waitTimeout) return // the user is interacting
    if (!(this.monitors.length > 0)) return

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

    const failing = this.monitors.filter(monitor => {
      let group = this.groupedResources.find(monitor)
      if (!group) return false
      return monitor.hasError()
    })

    if (failing.length > 0) {
      foldMonitors()
      this.$upandrunning.slideUp()
      this.$monitorsPanel.slideDown()
      this.monitorsFolding.showButton()
    } else {
      unfoldMonitors()
      this.$upandrunning.slideDown()
      this.$monitorsPanel.slideUp()
      this.monitorsFolding.hideButton()
    }
  },
  /**
   *
   * should be converted into a Monitors Panel View
   *
   */
  renderMonitorsPanel () {
    this.$upandrunning = $( this.queryByHook('up-and-running') )
    this.$monitorsPanel = $( this.queryByHook('monitors-container') )

    this.renderSubview(
      new MonitorsOptions(),
      this.queryByHook('monitors-panel-header')
    )

    this.monitorRows = this.renderCollection(
      this.groupedResources,
      MonitorRowView,
      this.queryByHook('monitors-container'),
      {
        emptyView:MonitoringOboardingPanel
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
        this.hideUpAndRunning()
        this.monitorsFolding.unfold()
      } else {
        this.monitorsFolding.fold()
        this.setUpAndRunningSign()
      }
    })

    this.listenToAndRun(App.state.dashboard.groupedResources,'add sync reset remove',() => {
      var monitorOptionsElem = this.queryByHook('monitor-options')
      if (App.state.dashboard.groupedResources.length>0) {
        if (monitorOptionsElem)
          monitorOptionsElem.style.visibility = ''
        if(this.monitorsFolding){
          this.monitorsFolding.unfold()
          this.monitorsFolding.showButton()
        }
        if(this.onBoarding)
          this.onBoarding.onboardingStart()
      } else {
        if (monitorOptionsElem)
          monitorOptionsElem.style.visibility = 'hidden'
        if(this.monitorsFolding) {
          this.monitorsFolding.hideButton()
          this.hideUpAndRunning()
        }
      }
    })

    this.listenToAndRun(App.state.tasks,'add sync reset remove',() => {
      if(this.tasksFolding) {
        if (App.state.tasks.length>0) {
          this.tasksFolding.showButton()
        } else {
          this.tasksFolding.hideButton()
        }
      }
    })

    // const setUpAndRunningSign = () => {
    //   if (!this.upandrunningSign) return // upandrunning is disabled
    //   if (this.waitTimeout) return // the user is interacting
    //   if (!(this.monitors.length>0)) return
    //
    //   /** move ok monitors to fold container **/
    //   const foldMonitors = () => {
    //     monitorRows.views.forEach(view => {
    //       let model = view.model
    //       if (! model.hasError()) {
    //         monitorsFolding.append( view.el )
    //       } else {
    //         this.$monitorsPanel.prepend( view.el )
    //       }
    //     })
    //   }
    //
    //   /** restore to default **/
    //   const unfoldMonitors = () => {
    //     monitorRows.views.forEach(view => {
    //       this.$monitorsPanel.append( view.el )
    //     })
    //   }
    //
    //   const failing = this.monitors.filter(monitor => {
    //     let group = this.groupedResources.find(monitor)
    //     if (!group) return false
    //     return monitor.hasError()
    //   })
    //
    //   if (failing.length>0) {
    //     foldMonitors()
    //     this.$upandrunning.slideUp()
    //     this.$monitorsPanel.slideDown()
    //     monitorsFolding.showButton()
    //   } else {
    //     unfoldMonitors()
    //     this.$upandrunning.slideDown()
    //     this.$monitorsPanel.slideUp()
    //     monitorsFolding.hideButton()
    //   }
    // }

    //const waitUntilStopInteraction = () => {
    //  if (!(this.monitors.length>0)) return
    //  if (this.waitTimeout) { // is already waiting
    //    clearTimeout(this.waitTimeout)
    //  }
    //  this.waitTimeout = setTimeout(() => {
    //    this.waitTimeout = null
    //    if (!App.state.searchbox.search) {
    //      setUpAndRunningSign()
    //      monitorsFolding.fold()
    //    }
    //  }, 10000) // wait for 10 secs and then fold/unfold again
    //}

    // Will re-check up and running when user stop interacting
    //this.listenTo(App,'document:input document:click',() => {
    //  logger.log('user interacting...')
    //  waitUntilStopInteraction()
    //})

    // Will re-check up and running when sync or state change
    this.listenToAndRun(this.monitors,'sync change:state', this.setUpAndRunningSign)
    // comment out double run, not fully tested, remove when ready
    // setUpAndRunningSign()
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
        emptyView:TasksOboardingPanel
      }
    )

    const runAllButton = new RunAllTasksButton({
      el: this.queryByHook('run-all-tasks')
    })
    runAllButton.render()
    this.registerSubview(runAllButton)

    this.listenTo(runAllButton,'runall',() => {
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

    const search = () => {
      if (taskRows) {
        searchRows({
          rows: taskRows.views,
          search: App.state.searchbox.search,
          onrow: (row, isHit) => {
            if (row.model.canExecute) {
              row.show = isHit
            }
          },
          onsearchend: () => {
            taskRows.views.forEach(row => row.show = true)
          }
        })

        runAllButton.visible = Boolean(App.state.searchbox.search)

        if (App.state.searchbox.search.length > 3) {
          const rows = taskRows.views.filter(row => row.show === true)
          if (!rows || rows.length===0) {
            // no rows to show
            runAllButton.disabled = true
          } else {
            // verify if all the tasks are not being executed
            const jobsInProgress = rows
              .map(row => row.model)
              .find(task => {
                const lifecycle = task.lastjob.lifecycle
                return LIFECYCLE.inProgress(lifecycle)
              })

            runAllButton.disabled = (jobsInProgress !== undefined)
          }
        } else {
          runAllButton.disabled = true
        }
      }
    }

    this.listenToAndRun(App.state.searchbox,'change:search',search)
  }
})
