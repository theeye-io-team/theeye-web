import App from 'ampersand-app'
import View from 'ampersand-view'
import $ from 'jquery'
import FilteredCollection from 'ampersand-filtered-subcollection'
import MonitorRowView from '../../monitor'

export default View.extend({
  template: `
    <section>
      <h3 class="list-title" data-hook="monitors-panel-header">
        Monitors
      </h3>
      <div>
        <div class="panel-group" id="monitor-accordion" role="tablist" aria-multiselectable="true">
          <section data-hook="monitors-container">
          </section>
        </div>
      </div>
    </section>
  `,
  initialize () {
    var filters = [
      model => {
        return (/Monitor/.test(model._type) || /Resource/.test(model._type))
      }
    ]
    this.monitors = new FilteredCollection(App.state.searchbox.results, { filters })
    View.prototype.initialize.apply(this,arguments)
  },
  render () {
    View.prototype.render.apply(this,arguments)
    this.renderMonitorsPanel()
  },
  renderMonitorsPanel () {
    this.monitorRows = this.renderCollection(
      this.monitors,
      MonitorRowView,
      this.queryByHook('monitors-container'),
      {
        emptyView: EmptyResultView
      }
    )

    const rowtooltips = this.query('[data-hook=monitors-container] .tooltiped')
    $(rowtooltips).tooltip()
  }
})

const EmptyResultView = View.extend({
  template: `<div class="no-result">No matches found</div>`
})

