import App from 'ampersand-app'
import View from 'ampersand-view'
import $ from 'jquery'
import FilteredCollection from 'ampersand-filtered-subcollection'
import TaskRowView from '../../task'
import RunAllTasksButton from '../../task/run-all-button'
import TaskActions from 'actions/task'
import WorkflowActions from 'actions/workflow'
import bootbox from 'bootbox'

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

const EmptyResultView = View.extend({
  template: `<div class="no-result">No matches found</div>`
})

module.exports = View.extend({
  template: `
    <section class="col-md-12 tasks-panel events-panel">
      <h3 class="list-title" data-hook="tasks-panel-header">
        Workflows
      </h3>
      <div>
        <div class="panel-group" id="task-accordion" role="tablist" aria-multiselectable="true">
          <section data-hook="run-all-tasks"> </section>
          <section data-hook="tasks-container"> </section>
        </div>
      </div>
    </section>
  `,
  initialize () {
    var filters = [
      model => {
        return (/Task/.test(model._type) || /Workflow/.test(model._type))
      }
    ]
    this.workflows = new FilteredCollection(App.state.searchbox.results, { filters })
    View.prototype.initialize.apply(this,arguments)
  },
  render () {
    View.prototype.render.apply(this,arguments)
    this.renderWorkflowsPanel()

    this.listenToAndRun(App.state.searchbox, 'change:search', this.updateRunAllButton)
    this.listenTo(App.state.searchbox, 'change:rowsViews', this.updateRunAllButton)
  },
  renderWorkflowsPanel () {
    this.workflowsRows = this.renderCollection(
      this.workflows,
      TaskRowView,
      this.queryByHook('tasks-container'),
      {
        emptyView: EmptyResultView
      }
    )

    this.runAllButton = new RunAllTasksButton({
      el: this.queryByHook('run-all-tasks')
    })

    this.runAllButton.render()
    this.registerSubview(this.runAllButton)

    this.listenTo(this.runAllButton, 'runall', () => {
      const rows = this.workflowsRows.views.filter(row => {
        return row.model.canExecute && row.show === true
      })
      runAllTasks(rows)
    })

    const rowtooltips = this.query('[data-hook=tasks-container] .tooltiped')
    $(rowtooltips).tooltip()
  },
  updateRunAllButton () {
    if (this.workflowsRows.views.length > 1) {
      this.runAllButton.visible = true

      const rows = this.workflowsRows.views
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
      this.runAllButton.disabled = (nonExecutableTasks !== undefined)
    } else {
      this.runAllButton.visible = false
      this.runAllButton.disabled = true
    }
  }
})
