import BaseView from 'view/base-view'
import ListItem from 'components/list/item'
import getHashParams from 'lib/get-hash-params'

import ListSearchBox from 'components/list/searchbox'
import ListHeader from 'components/list/header'

module.exports = BaseView.extend({
  template: require('./template.hbs'),
  props: {
    headerTitle: 'string',
    list: 'object',
    listFilter: ['string', false, '']
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
  derived: {
    filterValue: {
      deps: ['listFilter'],
      fn: function () {
        return this.filterRows(this.listFilter)
      }
    }
  },
  // This convenience method renders the list on data-hook=list-container
  // based on collection provided.
  renderList (ViewClass, options) {
    const View = (ViewClass || ListItem)

    this.list = this.renderCollection( // CollectionView
      this.collection,
      View,
      this.queryByHook('list-container'),
      options || {}
    )

    if (this.searchBox) {
      this.searchBox.set('inputValue', getHashParams().search)
    }
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
      new ListHeader({
        title: this.title
      }),
      this.queryByHook('header-container')
    )
    return this.header
  },
  // render searchbox
  renderSearchBox () {
    this.searchBox = this.renderSubview(
      new ListSearchBox(),
      this.queryByHook('searchbox-container')
    )
    return this.searchBox
  },
  // Selects all models in view's list marking them as selected:true
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
  // Filters models on view's list evaluating provided input
  // as unfiltering occurs (models turning from show:true to show:false)
  // models are also marked as selected:false, since we don't want
  // unshown models to be selected (may lead to undesired mass actions)
  // Returns filterValue (which is the argument received)
  filterRows (input) {
    if (!input || typeof input !== 'string' || this.listFilter.length < 3) {
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
    this.list.views.forEach(row => { row.show = true })
  },
  // Returns an array of selected models in the view's list
  getSelected () {
    return this.list.views.filter(item => {
      if (item.show && item.selectable) {
        return item.selected === true
      }
    })
  },
  render () {
    this.renderWithTemplate(this)
    this.renderSearchBox()
    this.renderHeader()
  }
})
