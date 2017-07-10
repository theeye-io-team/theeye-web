import BaseView from 'view/base-view'

// not yet. La idea es proveer la collection desde el parent
// y que el searchbox switchee la property 'show' en las views
// esto esta intimamente relacionado con los botones de
// mass-effect que solo deben afectar selected y visible
// y/o el mass-selector que solo tiene que selectar visibles
export default BaseView.extend({
  props: {
    inputValue: 'string',
    parentView: 'state'
  },
  template: `
    <div>
      <input data-hook="filter-input" type="text" placeholder="search...">
      <button data-hook="clear-filter-button" class="clean"><i class="glyphicon glyphicon-remove"></i></button>
      <button data-hook="search-button" class="search"><i class="glyphicon glyphicon-search"></i></button>
    </div>`,
  initialize: function (options) {
    options = options || {}
    this.parentView = options.parentView || this.parent
    this.on('change:inputValue', this.triggerSearch, this)
  },
  remove: function () {
    BaseView.prototype.remove.apply(this, arguments)
    this.off('change:inputValue', this.triggerSearch)
  },
  triggerSearch: function (view, value, dunno) {
    if (!this.parentView || !this.parentView.listFilter) {
      // last resource: try to get parentView from current parent
      if (this.parent && this.parent.listFilter !== undefined) {
        this.parentView = this.parent
      } else {
        console.log('no reachable parent view')
        // cancel if no reachable parent with listFilter prop
        return
      }
    }
    this.parentView.listFilter = value
    window.location.hash = 'search=' + value
  },
  events: {
    'input [data-hook=filter-input]': 'onInput',
    'click [data-hook=clear-filter-button]': 'clearSearch'
  },
  clearSearch: function (event) {
    this.inputValue = ''
  },
  onInput: function (event) {
    this.inputValue = event.target.value
  },
  bindings: {
    inputValue: [
      {
        type: 'booleanClass',
        name: 'active',
        hook: 'clear-filter-button'
      },
      {
        type: 'value',
        hook: 'filter-input'
      }
    ]
  }
})
