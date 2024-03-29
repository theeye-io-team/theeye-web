import View from 'ampersand-view'
import dom from 'ampersand-dom'
import 'select2'
import $ from 'jquery'
import './styles.less'

export default View.extend({
  template: `
    <div data-component="select2-view">
      <label data-hook="label" class="col-sm-3 control-label"></label>
      <div class="col-sm-9">
        <select class="form-control select" style="width:100%"></select>
        <div data-hook="message-container" class="message message-below message-error">
          <p data-hook="message-text"></p>
        </div>
      </div>
    </div>
  `,
  bindings: {
    visible: {
      type: 'toggle'
    },
    styles: {
      type: 'attribute',
      name: 'class'
    },
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
    label: [{
      hook: 'label'
    }, {
      type: 'toggle',
      hook: 'label'
    }],
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
    sort: ['boolean',false,true],
    visible: ['boolean',false,true ],
    styles: ['string',false,'form-group'],
    tokenSeparator: ['array',false,()=>{ return [] }],
    tags: ['boolean',false,false],
    multiple: ['boolean',false,false],
    name: 'string',
    inputValue: 'any',
    startingValue: 'any',
    options: 'any', // should be any object with array functions interface
    idAttribute: ['string',false,'id'],
    textAttribute: ['any',false,'text'],
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
    tabindex: ['number', true, 0],
    allowCreateTags: ['boolean',false,false],
    allowClear: ['boolean',false,false],
    createTags: ['any',false,() => {
      // default create tags function
      return function(params){
        return {
          id: params.term,
          text: params.term
        }
      }
    }],
    removeEmptyValues: ['boolean', false, false],
    ajax: ['object', false, null],
    enabled: 'boolean',
    autoselectSingleOption: ['boolean', true, false]
  },
  derived: {
    value: {
      deps: ['inputValue','multiple'],
      fn: function () {
        // this is set with $select2 data array value
        // it contains id and text attributes
        let input = this.inputValue
        if (this.multiple) {
          if (!input) return []
          if (Array.isArray(input)&&input.length===0) return []
          return input.map(e => e.id)
        } else {
          if (!input) return null
          if (Array.isArray(input)&&input.length===0) return null
          let values = input.map(e => e.id)
          return values[0]
        }
      }
    },
    valid: {
      cache: false,
      deps: ['inputValue'],
      fn: function () {
        return !this.runTests();
        //this.message = this.getErrorMessage()
        //return this.message === ''
      }
    },
    showMessage: {
      deps: ['message', 'shouldValidate'],
      fn: function () {
        return this.shouldValidate && Boolean(this.message)
      }
    },
    changed: {
      deps: ['inputValue','startingValue'],
      fn: function () {
        return this.inputValue !== this.startingValue;
      }
    },
    validityClass: {
      deps: ['valid', 'validClass', 'invalidClass', 'shouldValidate'],
      fn: function () {
        if (!this.shouldValidate) {
          return '';
        } else {
          return this.valid ? this.validClass : this.invalidClass
        }
      }
    }
  },
  initialize: function (spec) {
    spec || (spec = {})
    this.tests = spec.tests || []
    var value = spec.value
    this.startingValue = value
    this.handleChange = this.handleChange.bind(this)
    this.handleInputChanged = this.handleInputChanged.bind(this)
  },
  reset: function () {
    // this will reset the value to the original value and
    // trigger change on the select2 element for proper UI update
    this.$select.val(this.startingValue).trigger('change')
  },
  render () {
    this.renderWithTemplate(this)

    this.listenTo(this,'change:valid',this.reportToParent)
    this.listenTo(this,'change:validityClass',this.validityClassChanged)

    // start select2 component first
    this.renderSelect2Component(this.startingValue)
  },
  renderSelect2Component (value=null) {
    this.$select = $(this.query('select')).first()

    this.$select
      .select2({})
      .select2('destroy')
      .empty()
      .html('<option></option>')

    const select2setup = {
      templateResult: (data, container) => {
        if (Array.isArray(data.classList)) {
          data.classList.forEach(cn => container.classList.add(cn))
        }
        return data.text;
      },
      templateSelection: (data, $container) => {
        if (Array.isArray(data.classList)) {
          data.classList.forEach(cn => $container[0].classList.add(cn))
        }
        return data.text;
      },
      allowClear: this.allowClear,
      placeholder: this.unselectedText,
      tags: this.tags,
      tokenSeparator: this.tokenSeparator,
      createTag: (()=>{
        // https://select2.github.io/options.html#can-i-control-when-tags-are-created
        if (this.allowCreateTags === true) {
          return this.createTags
        } else {
          return function(){return null} // disable tag creation
        }
      })()
    }

    // sort by options
    if (this.sort !== false) {
      select2setup.sorter = function (items) {
        return items.sort((a, b) => Number(a.text) < Number(b.text) ? -1 : 1)
      }
    }

    if (this.options) {
      select2setup.data = this.prepareData(this.options)
    }

    if (this.ajax !== null) {
      const self = this
      select2setup.ajax = Object.assign({
        dataType: 'json',
        processResults: function (data) {
          // set internal options reference
          self.set('options', data, { silent: true })
          return { results: self.prepareData(data) }
        }
      }, this.ajax)
    }
   

    // select2 instantiate
    this.$select.select2(select2setup)

    // darn jquery event cannot be handled by
    // a method on this object
    this.$select.on('change',this.handleInputChanged)

    // then set value
    this.setValue(value||this.value)

    // the change:options event will be triggered when
    // the options object is completelly replaced
    this.listenTo(this, 'change:options', this.rerenderSelect2)

    this.listenToAndRun(this, 'change:enabled', () => {
      if (typeof this.enabled !== 'boolean') return

      if (this.enabled === true) {
        this.$select.removeAttr('disabled')
      } else if (this.enabled === false) {
        this.$select.attr('disabled', true)
      }
    })

    if (this.autoselectSingleOption) {
      if (this.value === null || this.value === []) {
        if (Array.isArray(this.options)) {
          if (this.options.length === 1) {
            this.setValue(this.options[0])
          }
        } else {
          // models property exists only if options.isCollection === true 
          if (this.options.isCollection && Array.isArray(this.options.models) && this.options.models.length === 1) {
            this.setValue(this.options.models[0]?.id)
          }
        }
      }
    }
  },
  prepareData (data) {
    return data.map(value => {
      return {
        text: this.getTextAttribute(value),
        id: value[this.idAttribute],
        classList: value.classList,
        disabled: value.disabled,
        selected: value.selected
      }
    })
  },
  getTextAttribute (attrs) {
    // use a custom user function to build the display text
    if (typeof this.textAttribute == 'function') {
      return this.textAttribute(attrs)
    } else {
      return attrs[this.textAttribute]
    }
  },
  rerenderSelect2 () {
    // get current config. options
    const select2Config = this.$select.data('select2').options.options
    // delete all items of the native select element
    this.$select.html('')
    this.$select.append(
      new Option(this.unselectedText, 0, false, false)
    )
    select2Config.data = this.prepareData(this.options)
    this.$select.select2(select2Config)
    //this.$select.trigger('change')
  },
  setValue (items) {
    if (!this.$select) {
      this.startingValue = items
      return
    }

    let data = []
    if (items) {
      if (items.isCollection) {
        if (items.length>0) {
          // items are treated as models
          items.forEach(model => {
            let val = model.get(this.idAttribute)
            if (!val) {
              return console.warn(`${model} properties are invalid`)
            }
            data.push(val)
          })
        }
      } else if (Array.isArray(items)) {
        // items are treated as plain objects
        if (items.length>0) {
          items.forEach(item => {
            if (!item) { return }

            if (typeof item == 'string') {
              data.push(item)
            } else if (item.hasOwnProperty(this.idAttribute)) {
              data.push(item[this.idAttribute])
            } else {
              console.warn(`${item} object properties are invalid`)
            }
          })
        }
      } else {
        // set single item
        data = items
      }
    }

    this.$select.val(data)
    this.$select.trigger('change')
    return
  },
  //`change` event handler
  handleInputChanged: function () {
    this.directlyEdited = true
    this.inputValue = this.$select.select2('data')
  },
  validityClassChanged: function (view, newClass) {
    var oldClass = view.previousAttributes().validityClass

    let msg = this.queryByHook('message-text')
    dom.switchClass(msg, oldClass, newClass)

    let label = this.queryByHook('label')
    dom.switchClass(label, oldClass, newClass)
  },
  reportToParent: function () {
    if (this.parent && this.parent.update) {
      this.parent.update(this)
    }
  },
  clear: function () {
    this.$select && this.$select.val([]).trigger('change')
  },
  getErrorMessage: function () {
    var message = ''
    if (this.required) {
      if (this.value === null) {
        return this.requiredMessage
      }
      if (Array.isArray(this.value) && this.value.length === 0) {
        return this.requiredMessage
      }
    }

    if (Array.isArray(this.tests) && this.tests.length > 0) {
      this.tests.find(test => {
        message = test.call(this, this.value) || ''
        return message
      }, this)
    }

    return message
  },
  handleChange: function () {
    if (this.inputValue && this.changed) {
      this.shouldValidate = true;
    }
    this.runTests()
  },
  runTests: function () {
    var message = this.getErrorMessage();
    if (!message && this.inputValue && this.changed) {
      // if it's ever been valid,
      // we want to validate from now
      // on.
      this.shouldValidate = true;
    }
    this.message = message;
    return message;
  },
  beforeSubmit: function () {
    this.inputValue = this.$select.select2('data')

    // at the point where we've tried
    // to submit, we want to validate
    // everything from now on.
    this.shouldValidate = true;
    this.runTests();
  },
  selected () {
    let value = this.value
    let selected

    if (this.multiple) {
      selected = []
      this.options.forEach(option => {
        if (value.indexOf(option.id) !== -1) {
          selected.push(option)
        }
      })
    } else {
      this.options.forEach(option => {
        if (option.id == value) {
          selected = option
        }
      })
    }
    return selected
  },
})
