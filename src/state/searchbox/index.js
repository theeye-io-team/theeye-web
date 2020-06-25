import State from 'ampersand-state'
import { filterRows, findMatches } from './filter-rows'
import uriFragment from 'lib/uri-fragment'
import AmpersandCollection from 'ampersand-collection'

const SearchBoxState = State.extend({
  props: {
    search: ['string', false, ''],
    matches: ['array', false, () => { return [] }],
    rowsViews: ['array', false, () => { return [] }]
  },
  collections: {
    results: AmpersandCollection
  },
  initialize () {
    State.prototype.initialize.apply(this,arguments)
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
  },
  findMatches (search) {
    findMatches(search)
  }
})

export default SearchBoxState
