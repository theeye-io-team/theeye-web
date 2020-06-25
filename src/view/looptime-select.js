'use strict'

import App from 'ampersand-app'
import SelectView from 'components/select2-view'

export default SelectView.extend({
  initialize (options) {
    this.options = App.state.looptimes
    this.multiple = false
    this.tags = false
    this.label = 'Check Interval (mins) *'
    this.name = 'looptime'
    this.styles = 'form-group'
    this.unselectedText = 'select the check interval'
    //this.idAttribute = 'email'
    //this.textAttribute = 'label'
    SelectView.prototype.initialize.apply(this,arguments)
  }
})
