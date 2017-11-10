'use strict'

import App from 'ampersand-app'
import SelectView from 'components/select2-view'
import FilteredCollection from 'ampersand-filtered-subcollection'
//import isEmail from 'validator/lib/isEmail'

module.exports = SelectView.extend({
  initialize (options) {
    this.options = App.state.members
    this.multiple = true
    this.tags = true
    this.label = options.label || 'Members'
    this.name = options.name || 'members'
    this.styles = 'form-group'
    //this.unselectedText = 'select a script'
    this.idAttribute = 'email'
    this.textAttribute = 'label'
    //this.allowCreateTags = true
    //
    //const basicCreateTags = this.createTags
    //this.createTags = function (value) {
    //  //test value before create tag
    //  if (isEmail(value)) basicCreateTags(value)
    //}

    SelectView.prototype.initialize.apply(this,arguments)
  }
})
