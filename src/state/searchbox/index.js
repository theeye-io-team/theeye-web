import App from 'ampersand-app'
import State from 'ampersand-state'
import uriFragment from 'lib/uri-fragment'
import AmpersandCollection from 'ampersand-collection'
import loggerModule from 'lib/logger'; const logger = loggerModule('state:searchbox')
import uniq from 'lodash/uniq'

export default State.extend({
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
      this.filterRows()
    })

    this.listenTo(this, 'change:rowsViews', () => {
      this.filterRows()
    })
  },
  filterRows () {
    const rows = this.rowsViews
    const search = this.search

    if (!search || typeof search !== 'string') {
      return this.endSearch()
    }

    const terms = parseTerms(search)

    this.results.set([])

    for (let row of rows) {
      if (!row.model.formatted_tags) {
        logger.error('no formatted_tags property available in model')
        return
      }

      if (!(row.model.formatted_tags.length > 0)) {
        logger.error('empty tags')
        return
      }

      let tags = row.model.formatted_tags
      let matches = searchTermsOverTags(terms, tags)

      if (row.model.submonitors || row.model.submodels) {
        const models = (row.model.submonitors || row.model.submodels).models
        for (let model of models) {
          tags = model.formatted_tags
          matches = matches.concat(searchTermsOverTags(terms, tags))
        }
      }

      const hit = Boolean(matches.length > 0)
      if (hit) {
        this.results.add(row.model)
      }
      this.trigger('onrow', { row, hit })
    }

    return
  },
  findMatches (search) {
    if (search === this.search) { return }
    if (search.length < 3) {
      if (this.matches.length > 0) {
        this.set('matches', [])
      }
      return
    }

    const rows = App.state.searchbox.rowsViews
    const terms = parseTerms(search)

    let totalMatches = []
    this.results.set([])

    for (let row of rows) {
      if (!row.model.formatted_tags) {
        logger.error('no formatted_tags property available in model')
        return
      }

      if (!(row.model.formatted_tags.length > 0)) {
        logger.error('empty tags')
        return
      }

      let tags = row.model.formatted_tags
      let matches = searchTermsOverTags(terms, tags)

      if (row.model.submonitors || row.model.submodels) {
        const models = (row.model.submonitors || row.model.submodels).models
        for (let model of models) {
          tags = model.formatted_tags
          matches = matches.concat(searchTermsOverTags(terms, tags))
        }
      }

      totalMatches = totalMatches.concat(matches)
    }

    this.set('matches', parseMatches(totalMatches))
    return
  },
  clearMatches () {
    this.set('matches', [])
  },
  endSearch () {
    for (let row of this.rowsViews) {
      row.show = true
    }
    return this
  },
  clearResults () {
    this.results.set([])
    return this
  }
})

const parseMatches = function (matches) {
  return uniq(matches.map(match => {
    if (match.indexOf('=') > -1) {
      match = match.substring(match.lastIndexOf('=') + 1)
    }
    return match
  }))
}

const parseTag = (tag) => {
  if (!tag) return null
  if (typeof tag !== 'string') return null
  return tag.toLowerCase()
}

const parseTerms = (search) => {
  const parsed = []
  let terms = search.toLowerCase().split('+')
  for (let i=0; i<terms.length; i++) {
    let term = terms[i].trim()
    if (typeof term === 'string' && Boolean(term)) {
      parsed.push(term)
    }
  }
  return parsed
}

const searchTermsOverTags = (terms,tags) => {
  const matches = []
  for (let i=0; i<tags.length; i++) {
    let tag = parseTag(tags[i])
    if (tag !== null) {
      for (let j=0; j<terms.length; j++) {
        let term = terms[j]
        if (RegExp(term).test(tag) === true) {
          matches.push(tag)
        }
      }
    }
  }
  return matches
}
