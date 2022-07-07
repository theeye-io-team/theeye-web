import App from 'ampersand-app'
import View from 'ampersand-view'
import $ from 'jquery'
import FilteredCollection from 'ampersand-filtered-subcollection'
import TaskRowView from '../../task'

export default View.extend({
  template: `
    <section>
      <h3 class="list-title" data-hook="tasks-panel-header">
        Workflows
      </h3>
      <div>
        <div class="panel-group" id="task-accordion" role="tablist" aria-multiselectable="true">
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

    this.workflowsRows = this.renderCollection(
      this.workflows,
      TaskRowView,
      this.queryByHook('tasks-container'),
      {
        emptyView: EmptyResultView
      }
    )

    const rowtooltips = this.query('[data-hook=tasks-container] .tooltiped')
    $(rowtooltips).tooltip()
  }
})

const EmptyResultView = View.extend({
  template: `<div class="no-result">No matches found</div>`
})
