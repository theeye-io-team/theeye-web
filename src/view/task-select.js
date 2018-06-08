'use strict'

import App from 'ampersand-app'
import SelectView from 'components/select2-view'
import FilteredCollection from 'ampersand-filtered-subcollection'

module.exports = SelectView.extend({
  initialize (specs) {

    var filters = [
      item => true,
      item => item.type === 'approval' || item.host_id
    ]

    if (
      Array.isArray(specs.filterOptions) &&
      specs.filterOptions.length
    ) {
      filters = filters.concat(specs.filterOptions)
    }

    var options = new FilteredCollection(
      specs.options || App.state.tasks,
      { filters }
    )

    this.options = options
    this.multiple = false
    this.tags = false
    this.label = specs.label || 'Task'
    this.name = specs.name || 'task'
    this.styles = 'form-group'
    this.unselectedText = 'select a task'
    this.idAttribute = 'id'
    this.textAttribute = 'summary'
    this.allowCreateTags = false

    SelectView.prototype.initialize.apply(this,arguments)
  }
})
