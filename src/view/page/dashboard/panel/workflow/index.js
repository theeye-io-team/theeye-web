import App from 'ampersand-app'
import TasksOptions from './tasks-options'
import PanelElementView from './element'
import TasksOboardingPanel from './tasks-onboarding'
import $ from 'jquery'
import View from 'ampersand-view'
import './styles.less'

export default View.extend({
  template: `
    <div data-component="panel-component">
      <section>
        <div class="header">
          <div data-hook="tasks-panel-header">
            <a data-hook="toggle-hidden-tasks" href="#" class="fa fa-chevron-right rotate section-toggle"></a>
          </div>
        </div>
        <div class="container">
          <section class="grid" data-hook="panel-container"> </section>
        </div>
      </section>
    </div>
  `,
  render () {
    this.renderWithTemplate(this)

    this.renderSubview(
      new TasksOptions(),
      this.queryByHook('tasks-panel-header')
    )

    this.taskRows = this.renderCollection(
      this.collection,
      PanelElementView,
      this.queryByHook('panel-container'),
      {
        emptyView: TasksOboardingPanel
      }
    )

    const rowtooltips = this.query('[data-hook=tasks-container] .tooltiped')
    $(rowtooltips).tooltip()

    App.actions.searchbox.addRowsViews(this.taskRows.views)

    //this.tasksFolding = this.renderSubview(
    //  new ItemsFolding({}),
    //  this.queryByHook('tasks-fold-container')
    //)

    //this.listenToAndRun(this.tasksFolding, 'change:visible', () => {
    //  this.showTasksPanel = this.tasksFolding.visible
    //})

    //this.taskRows.views.forEach(row => {
    //  let task = row.model
    //  if (!task.canExecute) {
    //    this.tasksFolding.append(row.el)
    //  }
    //})

    //this.listenToAndRun(App.state.tasks, 'add sync reset', () => {
    //  if (this.tasksFolding) {
    //    if (App.state.tasks.length > 0) {
    //      this.tasksFolding.showButton()
    //    } else {
    //      this.tasksFolding.hideButton()
    //    }
    //  }
    //})
  }
})
