'use strict'

import App from 'ampersand-app'
import SelectView from 'components/select2-view'

export default SelectView.extend({
  initialize () {
    this.options = App.state.extendedTags.tags
    this.multiple = true
    this.tags = true
    this.label = 'Tags'
    this.name = 'tags'
    this.styles = 'form-group'
    //this.unselectedText = 'select a script'
    this.idAttribute = 'name'
    this.textAttribute = 'name'
    this.allowCreateTags = true

    SelectView.prototype.initialize.apply(this,arguments)
  }
})
