'use strict'

const logger = require('lib/logger')('lib:filter-rows')

const filterRows = (specs) => {
  const { rows, search, onrow, onsearchend } = specs

  if (!search || typeof search !== 'string') {
    onsearchend()
    return
  }

  if (search.length < 3) return

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

  const terms = parseTerms(search)

  rows.forEach(row => {
    if ( !row.model.formatted_tags ) {
      logger.error('no formatted_tags property available in model')
      return
    }

    if ( ! (row.model.formatted_tags.length>0) ) {
      logger.error('empty tags')
      return
    }

    const tags = row.model.formatted_tags
    const matches = searchTermsOverTags(terms,tags)
    const hit = Boolean(matches.length > 0)

    onrow(row, hit)
  })

  return
}

module.exports = filterRows
