'use strict';

import App from 'ampersand-app'
import View from 'ampersand-view'
import Modalizer from 'components/modalizer'
import jquery from 'jquery'
import URI from 'urijs'
import PanelView from './panel'
import TaskRowView from './task'
import MonitorRowView from './monitor'
import RunAllTasksButton from './task/run-all-button'
import JobActions from 'actions/job'
import bootbox from 'bootbox'

const logger = require('lib/logger')('view:page:dashboard')
const ItemsFolding = require('./panel-items-fold')
const searchRows = require('lib/filter-rows')

import MonitorsOptions from './monitors-options'
import MonitoringOboardingPanel from './monitoring-onboarding'
import TasksOboardingPanel from './tasks-onboarding'

const runAllTasks = (rows) => {
  // doble check here
  if (rows.length>0) {
    const tasks = rows.map(row => row.model)

    const boxTitle = `With great power comes great responsibility`
		const boxMessage = `You are going to run all the following tasks.<br> This operation cannot be canceled`

		bootbox.confirm({
			title: boxTitle,
			message: boxMessage,
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
    upandrunningSign: ['boolean',false,true]
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
  },
  render () {
    this.renderWithTemplate()

    this.listenToAndRun(App.state.dashboard,'change:resourcesDataSynced',() => {
      if (App.state.dashboard.resourcesDataSynced===true) {
        if (this.groupedResources.length>0) {
          this.renderMonitorsPanel()
        } else {
          this.registerSubview(
            new MonitoringOboardingPanel({
              el: this.queryByHook('monitors-container')
            }).render()
          )
        }
        this.stopListening(App.state.dashboard,'change:resourcesDataSynced')
      }
    })

    if (this.renderTasks === true) {
      this.listenToAndRun(App.state.dashboard,'change:tasksDataSynced',() => {
        if (App.state.dashboard.tasksDataSynced===true) {
          if (this.tasks.length>0) {
            this.renderTasksPanel()
          } else {
            this.registerSubview(
              new TasksOboardingPanel({
                el: this.queryByHook('tasks-container')
              }).render()
            )
          }
          this.stopListening(App.state.dashboard,'change:tasksDataSynced')
        }
      })
    } else {
      // remove panel container
      this.queryByHook('tasks-panel').remove()
    }

    if (this.renderStats === true) {
      this.renderStatsPanel()
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

    const monitorRows = this.renderCollection(
      this.groupedResources,
      MonitorRowView,
      this.queryByHook('monitors-container')
    )

    const rowtooltips = this.query('[data-hook=monitors-container] .tooltiped')
    $(rowtooltips).tooltip()

    const monitorsFolding = this.renderSubview(
      new ItemsFolding({}),
      this.queryByHook('monitors-fold-container')
    )

    /** bind searchbox **/
    this.listenToAndRun(App.state.searchbox,'change:search',() => {
      if (monitorRows) {
        searchRows({
          rows: monitorRows.views,
          search: App.state.searchbox.search,
          onrow: (row, hit) => {
            row.show = Boolean(hit)
          },
          onsearchend: () => {
            monitorRows.views.forEach(row => row.show = true)
          }
        })
      }
      this.hideUpAndRunning()
    })

    const setUpAndRunningSign = () => {

      if (!this.upandrunningSign) return // upandrunning is disabled
      if (this.waitTimeout) return // the user is interacting
      if (!(this.monitors.length>0)) return

      /** move ok monitors to fold container **/
      const foldMonitors = () => {
        monitorRows.views.forEach(view => {
          let model = view.model
          if (! model.hasError()) {
            monitorsFolding.append( view.el )
          } else {
            this.$monitorsPanel.prepend( view.el )
          }
        })
      }

      /** restore to default **/
      const unfoldMonitors = () => {
        monitorRows.views.forEach(view => {
          this.$monitorsPanel.append( view.el )
        })
      }

      const failing = this.monitors.filter(monitor => {
        let group = this.groupedResources.find(monitor)
        if (!group) return false
        return monitor.hasError()
      })

      if (failing.length>0) {
        foldMonitors()
        this.$upandrunning.slideUp()
        this.$monitorsPanel.slideDown()
        monitorsFolding.showButton()
      } else {
        unfoldMonitors()
        this.$upandrunning.slideDown()
        this.$monitorsPanel.slideUp()
        monitorsFolding.hideButton()
      }
    }

    const waitUntilStopInteraction = () => {
      if (!(this.monitors.length>0)) return
      if (this.waitTimeout) { // is already waiting
        clearTimeout(this.waitTimeout)
      }
      this.waitTimeout = setTimeout(() => {
        this.waitTimeout = null
        if (!App.state.searchbox.search) {
          setUpAndRunningSign()
          monitorsFolding.fold()
        }
      }, 10000) // wait for 10 secs and then fold/unfold again
    }

    this.listenTo(App,'document:input document:click',() => {
      logger.log('user interacting...')
      waitUntilStopInteraction()
    })
    // events that can change monitors states
    // check state every time and reorganize view
    //this.listenTo(this.groupedResources,'reset change', () => { setUpAndRunningSign() })

    this.listenToAndRun(this.monitors,'sync change:state',() => {
      setUpAndRunningSign()
    })
    //setUpAndRunningSign()
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
      this.queryByHook('tasks-container')
    )

    const runAllButton = new RunAllTasksButton({
      el: this.queryByHook('run-all-tasks')
    })
    runAllButton.render()
    this.registerSubview(runAllButton)

    this.listenTo(runAllButton,'runall',() => {
      const rows = taskRows.views.filter(row => row.show === true)
      runAllTasks(rows)
    })

    const rowtooltips = this.query('[data-hook=tasks-container] .tooltiped')
    $(rowtooltips).tooltip()

    const tasksFolding = this.renderSubview(
      new ItemsFolding({}),
      this.queryByHook('tasks-fold-container')
    )

    taskRows.views.forEach(row => {
      let task = row.model
      if (!task.canExecute) {
        tasksFolding.append(row.el)
      }
    })

    const search = () => {
      if (taskRows) {
        searchRows({
          rows: taskRows.views,
          search: App.state.searchbox.search,
          onrow: (row, isHit) => {
            row.show = isHit
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
            // verify that all the tasks are not being executed
            const jobInProgress = rows
              .map(row => row.model)
              .find(task => {
                if (!task.lastjob.lifecycle) return false
                return task.lastjob.lifecycle !== 'completed'
              })

            runAllButton.disabled = (jobInProgress !== undefined)
          }
        } else {
          runAllButton.disabled = true
        }
      }
    }

    this.listenToAndRun(App.state.searchbox,'change:search',search)
  },
  renderStatsPanel () {
    this.renderSubview(
      new PanelView({
        col_class: 'col-md-6',
        title: 'Stats',
        name: 'stats'
      }),
      this.queryByHook('.admin-container.dashboard')
    )
  }
})
