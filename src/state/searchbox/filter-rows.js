'use strict'

import App from 'ampersand-app'
import SearchActions from 'actions/searchbox'
const logger = require('lib/logger')('lib:filter-rows')
import uniq from 'lodash/uniq'

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

const findMatches = (search) => {
  const rows = App.state.searchbox.rowsViews

  if (search.length < 3) {
    SearchActions.clearMatches()
    return
  }

  const terms = parseTerms(search)

  let totalMatches = []
  SearchActions.clearResults()

  rows.forEach(row => {
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

    if (row.model.submonitors) {
      row.model.submonitors.forEach((model) => {
        tags = model.formatted_tags
        matches = matches.concat(searchTermsOverTags(terms, tags))
      })
    }

    totalMatches = totalMatches.concat(matches)
  })

  SearchActions.setMatches(parseMatches(totalMatches))

  return
}

const filterRows = () => {
  const rows = App.state.searchbox.rowsViews
  const search = App.state.searchbox.search

  if (!search || typeof search !== 'string') {
    SearchActions.endSearch()
    return
  }

  const terms = parseTerms(search)

  SearchActions.clearResults()

  rows.forEach(row => {
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

    if (row.model.submonitors) {
      row.model.submonitors.forEach((model) => {
        tags = model.formatted_tags
        matches = matches.concat(searchTermsOverTags(terms, tags))
      })
    }

    const hit = Boolean(matches.length > 0)

    SearchActions.onRow(row, hit)

    if (hit) {
      SearchActions.addResults(row.model)
    }
  })

  return
}

module.exports.filterRows = filterRows
module.exports.findMatches = findMatches
