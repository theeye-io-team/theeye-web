import App from 'ampersand-app'
import View from 'ampersand-view'
import FilteredCollection from 'ampersand-filtered-subcollection'
import IndicatorRowView from '../../indicator'

export default View.extend({
  template: `
    <section class="col-md-12 indicators-panel events-panel">
      <h3 class="list-title">Indicators</h3>
      <div>
        <div class="panel-group" id="indicators-accordion" role="tablist" aria-multiselectable="true">
          <section data-hook="indicators-container"> </section>
          <section data-hook="indicators-fold-container"> </section>
        </div>
      </div>
    </section>
  `,
  initialize () {
    var filters = [
      model => {
        return /Indicator/.test(model._type)
      }
    ]
    this.indicators = new FilteredCollection(App.state.searchbox.results, { filters })
    View.prototype.initialize.apply(this,arguments)
  },
  render () {
    View.prototype.render.apply(this,arguments)
    this.renderIndicatorsPanel()
  },
  renderIndicatorsPanel () {
    this.indicatorsRows = this.renderCollection(
      this.indicators,
      IndicatorRowView,
      this.queryByHook('indicators-container'),
      {
        emptyView: EmptyResultView
      }
    )
  }
})

const EmptyResultView = View.extend({
  template: `<div class="no-result">No matches found</div>`
})
