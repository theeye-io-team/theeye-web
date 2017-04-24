// this only works extending base-view since
// it uses jquery (baseView.find returns a jquery object)
// Abstract when possible
import BaseView from 'view/base-view'
import matchesSelector from 'matches-selector'
import dom from 'ampersand-dom'
import 'select2'

function getMatches (el, selector) {
  if (selector === '') return [el]
  var matches = []
  if (matchesSelector(el, selector)) matches.push(el)
  return matches.concat(Array.prototype.slice.call(el.querySelectorAll(selector)))
}

export default BaseView.extend({
  template: `
    <div class="form-group form-horizontal">
      <label data-hook="label" class="col-sm-3 control-label"></label>
      <div class="col-sm-9">
        <select class="form-control select" style="width:100%"></select>
        <div data-hook="message-container">
          <p data-hook="message-text" class="alert alert-warning"></p>
        </div>
      </div>
    </div>`,
  bindings: {
    multiple: {
      type: 'booleanAttribute',
      selector: 'select',
      name: 'multiple'
    },
    name: {
      type: 'attribute',
      selector: 'select',
      name: 'name'
    },
    tabindex: {
      type: 'attribute',
      selector: 'select',
      name: 'tabindex'
    },
    label: [
      {
        hook: 'label'
      },
      {
        type: 'toggle',
        hook: 'label'
      }
    ],
    message: {
      type: 'text',
      hook: 'message-text'
    },
    showMessage: {
      type: 'toggle',
      hook: 'message-container'
    },
    autofocus: { // ?
      type: 'booleanAttribute',
      name: 'autofocus',
      selector: 'select'
    }
  },
  props: {
    tokenSeparator: ['array',false,()=>{ return [] }],
    tags: ['boolean',false,false],
    multiple: ['boolean',false,false],
    name: 'string',
    inputValue: 'any',
    startingValue: 'any',
    options: 'any', // should be any object with array functions interface
    idAttribute: ['string',false,'id'],
    textAttribute: ['string',false,'text'],
    type: ['string', true, 'text'],
    unselectedText: ['string', true, ''],
    label: ['string', true, ''],
    required: ['boolean', true, false],
    autofocus: ['boolean', true, false],
    shouldValidate: ['boolean', true, false],
    message: ['string', true, ''],
    requiredMessage: ['string', true, 'This field is required.'],
    validClass: ['string', true, 'input-valid'],
    invalidClass: ['string', true, 'input-invalid'],
    validityClassSelector: ['string', true, 'select'],
    tabindex: ['number', true, 0],
    allowCreateTags: ['boolean',false,false],
    createTags: ['any',false,() => {
      // default create tags function
      return function(params){
        return {
          id: params.term,
          text: params.term
        }
      }
    }]
  },
  derived: {
    value: {
      deps: ['inputValue'],
      fn: function () {
        return this.inputValue
      }
    },
    valid: {
      deps: ['inputValue'],
      fn: function () {
        this.message = this.getErrorMessage()
        return this.message === ''
      }
    },
    showMessage: {
      deps: ['message'],
      fn: function () {
        return Boolean(this.message)
      }
    },
    validityClass: {
      deps: ['valid', 'validClass', 'invalidClass'],
      fn: function () {
        return this.valid ? this.validClass : this.invalidClass
      }
    }
  },
  initialize: function (spec) {
    spec || (spec = {})
    this.tests = spec.tests || []
    var value = spec.value
    this.startingValue = value
    this.inputValue = value
  },
  reset: function () {
    // this will reset the value to the original value and
    // trigger change on the select2 element for proper UI update
    this.$input.val(this.startingValue).trigger('change')
  },
  render: function () {
    this.renderWithTemplate(this)
    this.$input = this.find('select').first()

    const select2setup = {
      placeholder: this.unselectedText,
      tags: this.tags,
      tokenSeparator: this.tokenSeparator,
			createTag: (()=>{
        // https://select2.github.io/options.html#can-i-control-when-tags-are-created
        if (!this.allowCreateTags) {
          return function(){return null} // disable tag creation
        } else {
          return this.createTags
        }
      })()
    }

    if (this.options) {
      select2setup.data = this.options.map((value, index) => {
        return {
          text: value[this.textAttribute],
          id: value[this.idAttribute]
        }
      })
    }

    // select2 instantiate
    this.$input.select2(select2setup)

    this.on('change:valid', this.reportToParent, this)
    this.on('change:validityClass', this.validityClassChanged, this)

    // darn jquery event cannot be handled by
    // a method on this object
    this.$input.on('change', event => {
      this.set('inputValue', this.$input.val())
    })

    this.$input.val(this.inputValue)
    this.$input.trigger('change')
  },
  remove: function () {
    this.off('change:valid', this.reportToParent)
    this.off('change:validityClass', this.validityClassChanged)

    BaseView.prototype.remove.apply(this, arguments)
  },
  validityClassChanged: function (view, newClass) {
    var oldClass = view.previousAttributes().validityClass
    getMatches(this.el, this.validityClassSelector).forEach(function (match) {
      dom.switchClass(match, oldClass, newClass)
    })
  },
  reportToParent: function () {
    if (this.parent) this.parent.update(this)
  },
  clear: function () {
    this.$input
      .val([])
      .trigger('change')
  },
  getErrorMessage: function () {
    var message = ''
    if (this.required && !this.inputValue) {
      return this.requiredMessage
    }
    else if (Array.isArray(this.inputValue) && this.inputValue.length === 0) {
      return this.requiredMessage
    }
    else {
      (this.tests || []).some(function (test) {
        message = test.call(this, this.value) || ''
        return message
      }, this)
      return message
    }
  }
})
