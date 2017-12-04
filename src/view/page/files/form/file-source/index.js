'use strict'

import View from 'ampersand-view'
import Collection from 'ampersand-collection'
import HelpIcon from 'components/help-icon'

module.exports = View.extend({
  template: `
  	<div class="form-group">
			<label class="col-sm-3 control-label" data-hook="label">File Source</label>
  	  <div class="col-sm-9">
  	    <label class="radio-inline">
  	      <input type="radio" name="source" data-hook="editor" value="editor"> Live editor
  	    </label>
  	    <label class="radio-inline">
  	      <input type="radio" name="source" data-hook="upload" value="fileupload"> File upload
  	    </label>
  	    <label class="radio-inline">
  	      <input type="radio" name="source" data-hook="gist" value="gist"> From gist
  	    </label>
  	  </div>
  	</div>
  `,
  bindings: {
    visible: {
      type: 'toggle'
    }
  },
  props: {
    visible: ['boolean',false,true],
		inputValue: ['string',false]
  },
  initialize (options) {
    View.prototype.initialize.apply(this,arguments)
  },
  events: {
  },
  render () {
    this.renderWithTemplate(this)
  },
  /**
   * @param {Mixed} value array of objects/models or a collection
   */
  setValue (value) {
  },
  derived: {
    valid: {
      fn () {
        return true
      }
    },
    value: {
      cache: false,
      fn () {
        return this.inputValue
      }
    }
  }
})
