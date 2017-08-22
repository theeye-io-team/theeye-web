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
    tagsSelected: 'array'
  },
  events: {
    'click [data-hook=up-and-running] i':'hideUpAndRunning',
    'click [data-hook=show-more-options]':'showMoreOptions',
  },
  showMoreOptions (event) {
    event.preventDefault()
    event.stopPropagation()
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
          this.renderSubview(
            new MonitoringOboardingPanel(),
            this.queryByHook('monitors-container')
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
            this.renderSubview(
              new TasksOboardingPanel(),
              this.queryByHook('tasks-container')
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
  renderMonitorsPanel () {

    this.$upandrunning = $( this.queryByHook('up-and-running') )
    this.$monitorsPanel = $( this.queryByHook('monitors-container') )

    this.monitorRows = this.renderCollection(
      this.groupedResources,
      MonitorRowView,
      this.queryByHook('monitors-container')
    )

    const rowtooltips = this.query('[data-hook=monitors-container] .tooltiped')
    $(rowtooltips).tooltip()

    this.monitorsFolding = this.renderSubview(
      new ItemsFolding({}),
      this.queryByHook('monitors-fold-container')
    )

    /** bind searchbox **/
    this.listenToAndRun(App.state.searchbox,'change:search',() => {
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
      this.hideUpAndRunning()
    })

    const waitUntilStopInteraction = () => {
      if (!(this.monitors.length>0)) return
      if (this.waitTimeout) { // is already waiting
        clearTimeout(this.waitTimeout)
      }
      this.waitTimeout = setTimeout(() => {
        if (!App.state.searchbox.search) {
          this.checkUpAndRunningMonitors()
          this.monitorsFolding.fold()
        }
      }, 10000) // wait for 10 secs and then fold/unfold again
    }

    this.listenTo(App,'document:input document:click',() => {
      logger.log('user interacting...')
      waitUntilStopInteraction()
    })
    // events that can change monitors states
    // check state every time and reorganize view
    this.listenTo(this.groupedResources,'reset change',() => {
      this.checkUpAndRunningMonitors()
    })
    this.listenTo(this.monitors,'sync change',() => {
      this.checkUpAndRunningMonitors()
    })
    //for (let i=0; i<this.monitorRows.views.length; i++) {
    //  let view = this.monitorRows.views[i]
    //  view.on('change', this.checkUpAndRunningMonitors, this)
    //}

    this.checkUpAndRunningMonitors()
  },
  checkUpAndRunningMonitors () {
    if (!(this.monitors.length>0)) return

    /** move ok monitors to fold container **/
    const foldMonitors = () => {
      this.monitorRows.views.forEach(view => {
        let group = view.model // model is a grouped resources model
        let hasError = group.hasError() || group.submonitorsWithError()
        if (!hasError) {
          this.monitorsFolding.append( view.el )
        } else {
          this.$monitorsPanel.prepend( view.el )
        }
      })
    }

    /** restore to default **/
    const unfoldMonitors = () => {
      this.monitorRows.views.forEach(view => {
        this.$monitorsPanel.append( view.el )
      })
    }

    const failing = this.monitors.filter(monitor => {
      // check if monitor is in a group
      let group = this.groupedResources.find(group => {
        let sm = group.submonitors.get( monitor.get('id') )
        return sm !== undefined
      })
      if (!group) return false
      return monitor.hasError() || monitor.submonitorsWithError()
    })

    if (failing.length>0) {
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
  renderTasksPanel () {
    this.taskRows = this.renderCollection(
      this.tasks,
      TaskRowView,
      this.queryByHook('tasks-container')
    )

    const runAllButton = new RunAllTasksButton({ el: this.queryByHook('run-all-tasks') })
    runAllButton.render()
    this.registerSubview(runAllButton)

    this.listenTo(runAllButton,'runall',() => {
      const rows = this.taskRows.views.filter(row => row.show === true)
      runAllTasks(rows)
    })

    const rowtooltips = this.query('[data-hook=tasks-container] .tooltiped')
    $( rowtooltips ).tooltip()

    this.tasksFolding = this.renderSubview(
      new ItemsFolding({}),
      this.queryByHook('tasks-fold-container')
    )

    const search = () => {
      if (this.taskRows) {
        searchRows({
          rows: this.taskRows.views,
          search: App.state.searchbox.search,
          onrow: (row, hit) => {
            row.show = hit
          },
          onsearchend: () => {
            this.taskRows.views.forEach(row => row.show = true)
          }
        })

        const showrunall = Boolean(App.state.searchbox.search)
        runAllButton.visible = showrunall
        runAllButton.disabled = App.state.searchbox.search.length < 3 ||
          this.taskRows.views.find(row => Boolean(row.show === true)) === undefined
      }
    }

    this.listenToAndRun(App.state.searchbox, 'change:search', search)
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
