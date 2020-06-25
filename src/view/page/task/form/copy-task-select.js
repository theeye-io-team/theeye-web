'use strict'

import App from 'ampersand-app'
import SelectView from 'components/select2-view'
import SubCollection from 'ampersand-filtered-subcollection'

export default SelectView.extend({
  props: {
    type: 'string'
  },
  initialize (options) {
    this.type = options.type

    this.options = new SubCollection(App.state.tasks, { where: { type: this.type }})
    this.multiple = false
    this.tags = false
    this.label = 'Copy Task'
    this.name = 'copy_task'
    this.styles = 'form-group'
    this.required = false
    //this.unselectedText = 'select a script'
    this.idAttribute = 'id'
    this.textAttribute = 'name'
    this.textAttribute = 'summary'
    this.allowCreateTags = false

    SelectView.prototype.initialize.apply(this,arguments)
  }
})
