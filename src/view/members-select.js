'use strict'

import App from 'ampersand-app'
import SelectView from 'components/select2-view'
import FilteredCollection from 'ampersand-filtered-subcollection'
//import isEmail from 'validator/lib/isEmail'

module.exports = SelectView.extend({
  initialize (specs) {
    this.options = specs.options || App.state.members
    this.multiple = (typeof specs.multiple === 'boolean') ? specs.multiple : true
    this.tags = specs.tags || true
    this.label = specs.label || 'Members'
    this.name = specs.name || 'members'
    this.styles = specs.styles || 'form-group'
    this.idAttribute = specs.idAttribute || 'email'
    this.textAttribute = specs.textAttribute || 'label'
    //this.allowCreateTags = true
    //const basicCreateTags = this.createTags
    //this.createTags = function (value) {
    //  //test value before create tag
    //  if (isEmail(value)) basicCreateTags(value)
    //}
    
    SelectView.prototype.initialize.apply(this,arguments)
  }
})
