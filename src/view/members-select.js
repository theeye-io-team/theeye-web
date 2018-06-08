'use strict'

import App from 'ampersand-app'
import SelectView from 'components/select2-view'
import FilteredCollection from 'ampersand-filtered-subcollection'
//import isEmail from 'validator/lib/isEmail'

module.exports = SelectView.extend({
  initialize (specs) {

    var filters = [ item => true ]

    if (
      Array.isArray(specs.filterOptions) &&
      specs.filterOptions.length
    ) {
      filters = filters.concat(specs.filterOptions)
    }

    var options = new FilteredCollection(
      specs.options || App.state.members,
      { filters }
    )

    this.options = options
    this.multiple = (typeof specs.multiple === 'boolean') ? specs.multiple : true
    this.tags = specs.tags || true
    this.label = specs.label || 'Members'
    this.name = specs.name || 'members'
    this.styles = specs.styles || 'form-group'
    this.idAttribute = specs.idAttribute || 'email'
    this.textAttribute = specs.textAttribute || 'label'
    
    SelectView.prototype.initialize.apply(this,arguments)
  }
})
