'use strict'

import App from 'ampersand-app'
import SelectView from 'components/select2-view'
import SubCollection from 'ampersand-filtered-subcollection'

module.exports = SelectView.extend({
  //props: {
  //  type: 'string'
  //},
  initialize (options) {
    let filter = options.filter

    if (filter) {
      this.options = new SubCollection(App.state.resources, { filter })
    } else {
      this.options = App.state.resources
    }

    this.allowCreateTags = false
    this.multiple = true
    this.tags = true
    this.label = 'Select Monitors'
    this.name = 'monitors'
    this.styles = 'form-group'
    //this.unselectedText = 'select a script'
    this.idAttribute = 'id'
    this.textAttribute = (attrs) => `[${attrs['type']}] ${attrs['hostname']} ${attrs['name']}`

    SelectView.prototype.initialize.apply(this, arguments)
  }
})
