'use strict'

import App from 'ampersand-app'
import SelectView from 'components/select2-view'
import FilteredCollection from 'ampersand-filtered-subcollection'

module.exports = SelectView.extend({
  initialize (specs) {

    var filters = [ item => true ]

    if (
      Array.isArray(specs.filterOptions) &&
      specs.filterOptions.length
    ) {
      filters = filters.concat(specs.filterOptions)
    }

    var options = new FilteredCollection(App.state.tasks, { filters })
    Object.assign(this, {
      options: options,
      multiple: false,
      tags: false,
      label: 'Task',
      name: 'task',
      styles: 'form-group',
      unselectedText: 'select a task',
      idAttribute: 'id',
      textAttribute: 'summary',
      allowCreateTags: false
    }, specs)

    SelectView.prototype.initialize.apply(this,arguments)
  }
})
