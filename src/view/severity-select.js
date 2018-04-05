'use strict'

import App from 'ampersand-app'
import SelectView from 'components/select2-view'

module.exports = SelectView.extend({
  initialize (options) {
    this.options = App.state.severities
    this.multiple = false
    this.tags = false
    this.label = 'Severity'
    this.name = 'failure_severity'
    this.styles = 'form-group'
    this.unselectedText = 'select the severity'
    //this.idAttribute = 'email'
    //this.textAttribute = 'label'
    SelectView.prototype.initialize.apply(this,arguments)
  }
})
