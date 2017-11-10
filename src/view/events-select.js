'use strict'

import App from 'ampersand-app'
import SelectView from 'components/select2-view'
import FilteredCollection from 'ampersand-filtered-subcollection'
//import isEmail from 'validator/lib/isEmail'

module.exports = SelectView.extend({
  initialize (options) {

    this.options = new FilteredCollection(
      App.state.events,
      {
        where: {
          displayable: true
        }
      }
    )

    this.multiple = true
    this.tags = true
    this.label = options.label || 'Events'
    this.name = options.name || 'events'
    this.styles = 'form-group'
    this.unselectedText = 'Select one or more events'
    this.idAttribute = 'id'
    this.textAttribute = 'summary'

    SelectView.prototype.initialize.apply(this,arguments)
  }
})
