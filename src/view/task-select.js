'use strict'

import App from 'ampersand-app'
import SelectView from 'components/select2-view'

module.exports = SelectView.extend({
  initialize (specs) {
    Object.assign(this, {
      options: App.state.tasks,
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
