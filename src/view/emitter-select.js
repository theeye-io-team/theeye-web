'use strict'

import App from 'ampersand-app'
import SelectView from 'components/select2-view'
import FilteredCollection from 'ampersand-filtered-subcollection'
//import isEmail from 'validator/lib/isEmail'

module.exports = SelectView.extend({
  initialize (options) {
    console.warn('use emitter-select with caution!')
    var filters = [
      item => {
        return true
      }
    ]

    if (Array.isArray(options.filterOptions) && options.filterOptions.length) {
      filters = filters.concat(options.filterOptions)
    }

    this.options = new FilteredCollection(App.state.emitters, { filters })

    this.multiple = false
    this.tags = false
    this.label = options.label || 'Event emitters'
    this.name = options.name || 'emitter'
    this.styles = 'form-group'
    this.unselectedText = 'Select an event emitter'
    this.idAttribute = 'id'
    this.textAttribute = 'summary'

    SelectView.prototype.initialize.apply(this,arguments)
  }
})
