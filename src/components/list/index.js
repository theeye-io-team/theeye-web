import App from 'ampersand-app'
import View from 'ampersand-view'
import ListItem from 'components/list/item'
import ListHeader from 'components/list/header'
import { CollectionPaginator } from 'view/page/paginator/footer'
import Collection from 'ampersand-collection'

export default View.extend({
  autoRender: true,
  template: `
    <div class="admin-container">
      <div class="admin-panel">
        <h3 class="list-title" data-hook="list-title"></h3>
        <div>
          <div data-hook="header-container"></div>
          <div id="new-accordion" data-hook="list-container"
            class="panel-group" role="tablist" aria-multiselectable="true">
          </div>
          <div data-hook="paginator-container"></div>
        </div>
      </div>
    </div>
  `,
  props: {
    headerTitle: 'string',
    list: 'object'
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
   * Convenient method to render the page header.
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
    this.View = (ViewClass || ListItem)
    this.options = options
    this.paginator = new CollectionPaginator({
      length: this.collection.models.filter(model => model.show === true).length,
      label: this.title.toLowerCase()
    })
    this.renderSubview(this.paginator, this.queryByHook('paginator-container'))
    this.subCollection = new Collection(
      this.collection.models.filter(model => model.show === true).slice(
        this.paginator.page * this.paginator.pageLenght,
        (this.paginator.page * this.paginator.pageLenght) + this.paginator.pageLenght
      )
    )

    this.list = this.renderCollection( // CollectionView
      this.subCollection,
      this.View,
      this.queryByHook('list-container'),
      this.options || {}
    )

    this.listenTo(App.state.searchbox, 'onrow', (data) => {
      const row = data.row
      const hit = data.hit
      if (hit) {
        row.show = true
      } else {
        row.show = false
        row.selected = false
      }
    })

    this.listenTo(App.state.searchbox, 'rerender', (data) => {
      this.updateList(true)
    })

    this.listenToAndRun(this.collection, 'sync reset add remove', function () {
      this.updateList(true)
      App.actions.searchbox.resetRowsViews(this.collection.models)
    })
  },
  updateList (isNewList = false) {
    this.paginator.length = this.collection.models.filter(model => model.show === true).length


    this.subCollection = new Collection(
      this.collection.models.filter(model => model.show === true).slice(
        this.paginator.page * this.paginator.pageLength,
        (this.paginator.page * this.paginator.pageLength) + this.paginator.pageLength
      )
    )

    isNewList && (this.paginator.page = 0)
    this.paginator.trigger('changeList')

    this.list.remove()

    this.list = this.renderCollection( // CollectionView
      this.subCollection,
      this.View,
      this.queryByHook('list-container'),
      this.options || {}
    )
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
  }
})
