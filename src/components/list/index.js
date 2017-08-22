import App from 'ampersand-app'
import View from 'ampersand-view'
//import View from 'view/base-view'
import ListItem from 'components/list/item'
import ListHeader from 'components/list/header'
const filterRows = require('lib/filter-rows')

module.exports = View.extend({
  autoRender: true,
  template: `
    <div class="admin-container">
      <div class="admin-panel">
        <h3 data-hook="list-title"></h3>
        <div>
          <div data-hook="header-container"></div>
          <div id="new-accordion" data-hook="list-container"
            class="panel-group" role="tablist" aria-multiselectable="true">
          </div>
        </div>
      </div>
    </div>
  `,
  props: {
    headerTitle: 'string',
    list: 'object',
  },
  bindings: {
    title: [
      { hook: 'list-title' },
      {
        type: 'toggle',
        hook: 'list-title'
      }
    ]
  },
  render () {
    this.renderWithTemplate(this)
    this.renderHeader()
  },
  /** 
   *
   * Convenience method to render the page header
   * If you need a different header, just override
   *
   * @author Facugon
   *
   */
  renderHeader () {
    this.header = this.renderSubview(
      new ListHeader({ title: this.title }),
      this.queryByHook('header-container')
    )
    return this.header
  },
  /**
   * This convenience method renders the list on data-hook=list-container
   * based on collection provided.
   */
  renderList (ViewClass, options) {
    const View = (ViewClass || ListItem)

    this.list = this.renderCollection( // CollectionView
      this.collection,
      View,
      this.queryByHook('list-container'),
      options || {}
    )

    // search works with the list items
    this.listenToAndRun(App.state.searchbox,'change:search',function(){
      filterRows({
        rows: this.list.views,
        search: App.state.searchbox.search,
        onrow: (row, hit) => {
          if (hit) {
            row.show = true
          } else {
            row.show = false
            row.selected = false
          }
        },
        onsearchend: () => {
          this.list.views.forEach(row => row.show = true)
        }
      })
    })
  },
  filterRows (input) {
    if (!input || typeof input !== 'string' || input.length < 3) {
      this.showAllRows()
      return ''
    }

    const inputValue = input.toLowerCase()

    this.list.views.forEach(row => {
      if (row.tags.toLowerCase().indexOf(inputValue) !== -1) {
        row.show = true
      } else {
        row.show = false
        row.selected = false
      }
    })

    return input
  },
  // Mark all models in the view's list with show:true
  showAllRows () {
    this.list.views.forEach(row => {
      row.show = true
    })
  },
  selectAllRows () {
    this.list.views.forEach(row => {
      if (row.show && row.selectable) {
        row.selected = true
      }
    })
  },
  // Unselects all models in view's list marking them as selected:false
  deselectAll () {
    this.list.views.forEach(row => {
      row.selected = false 
    })
  },
  // Returns an array of selected models in the view's list
  getSelected () {
    return this.list.views.filter(item => {
      if (item.show && item.selectable) {
        return item.selected === true
      }
    })
  },
})
