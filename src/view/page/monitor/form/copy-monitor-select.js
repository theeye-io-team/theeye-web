'use strict'

import App from 'ampersand-app'
import SelectView from 'components/select2-view'
import SubCollection from 'ampersand-filtered-subcollection'

module.exports = SelectView.extend({
  props: {
    type: 'string'
  },
  initialize (options) {
    this.type = options.type

    this.options = new SubCollection(App.state.resources, { where: { type: this.type }})
    this.multiple = false
    this.tags = false
    this.allowClear = true
    this.label = 'Copy Monitor'
    this.name = 'copy_monitor'
    this.styles = 'form-group'
    this.required = false
    //this.unselectedText = 'select a script'
    this.idAttribute = 'id'
    this.textAttribute = 'name'
    this.allowCreateTags = true

    SelectView.prototype.initialize.apply(this,arguments)
  }
})
