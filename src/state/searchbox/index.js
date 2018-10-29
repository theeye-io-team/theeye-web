import State from 'ampersand-state'
import filterRows from './filter-rows'
import uriFragment from 'lib/uri-fragment'

const SearchBoxState = State.extend({
  props: {
    search: ['string', false, ''],
    matches: ['array', false, () => { return [] }],
    rowsViews: ['array', false, () => { return [] }]
  },
  initialize () {
    State.prototype.initialize.apply(this,arguments)

    //const uri = new URI(window.location)
    //const fragment = uri.fragment()
    const fragment = uriFragment.get()

    if (fragment.search) {
      this.search = fragment.search
    }

    this.listenTo(this, 'change:search', () => {
      uriFragment.set('search', this.search)
      filterRows()
    })

    this.listenTo(this, 'change:rowsViews', () => {
      filterRows()
    })
  }
})

module.exports = SearchBoxState
