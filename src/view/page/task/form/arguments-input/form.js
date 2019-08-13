'use strict'

import View from 'ampersand-view'
import State from 'ampersand-state'
import FormView from 'ampersand-form-view'
import InputView from 'components/input-view'
import FIELD from 'constants/field'
import { ValueOption as ArgumentValueOption } from 'models/task/dinamic-argument'
import isURL from 'validator/lib/isURL'

const SimpleInputView = InputView.extend({
  template: `
    <div style="margin:0;">
      <input class="form-control form-input">
      <div data-hook="message-container" class="message message-below message-error">
        <p data-hook="message-text"></p>
      </div>
    </div>
  `
})

const ArgumentButton = View.extend({
  template: `
	  <div class="form-group">
      <label class="col-sm-3 control-label" data-hook="label"></label>
      <div class="col-sm-9">
        <div>
          <button class="btn btn-primary" style="width:100%">
            <span data-hook="button-label"></span>
            <i data-hook="icon" class="fa"></i>
          </button>
        </div>
      </div>
    </div>
  `,
  events: {
    'click button':'onClickButton'
  },
  initialize () {
    View.prototype.initialize.apply(this,arguments)

    this.valid = true
    this.value = undefined
    this.name = 'button'
  },
  props: {
    buttonLabel: 'string',
    icon: ['string',false]
  },
  bindings: {
    icon: [{
      type: 'toggle',
      hook: 'icon'
    },{
      type: 'booleanClass',
      hook: 'icon'
    }],
    buttonLabel: {
      hook: 'button-label'
    }
  },
  onClickButton (event) {
    event.preventDefault()
    event.stopPropagation()
    this.trigger('click')
  }
})

const OptionView = View.extend({
  template: `
    <li class="list-group-item">
      <div class="row">
        <span class="col-xs-5" data-hook="id"> </span>
        <span class="col-xs-5" data-hook="label"> </span>
        <span class="col-xs-2">
          <span class="btn" data-hook="remove-option">
            <i class="fa fa-remove"></i>
          </span>
        </span>
      </div>
    </li>
  `,
  initialize () {
    View.prototype.initialize.apply(this,arguments)
    this.updateState(this.model)
    this.on('change:valid change:value', this.reportToParent, this);
  },
  updateState (state) {
    this.id = state.id
    this.label = state.label
    this.order = state.order
  },
  events: {
    'click [data-hook=remove-option]':'onclickremoveoption'
  },
  props: {
    id: 'string',
    order: 'number',
    label: 'string',
    name: ['string',false,'option'] // my input name
  },
  render () {
    this.renderWithTemplate(this)

    this.idInputView = new SimpleInputView({
      name: 'value',
      value: this.model.id,
      placeholder: 'Value',
      required: true
    })
    this.renderSubview( this.idInputView, this.queryByHook('id') )

    this.labelInputView = new SimpleInputView({
      name: 'label',
      value: this.model.label,
      placeholder: 'Label',
      required: true
    })
    this.renderSubview( this.labelInputView, this.queryByHook('label') )

    this.listenTo( this.idInputView, 'change:value', () => {
      this.id = this.idInputView.value
      this.labelInputView.setValue( this.idInputView.value )
    })

    this.listenTo( this.labelInputView, 'change:value', () => {
      this.label = this.labelInputView.value
    })

    this.idInputView.input.focus()
  },
  onclickremoveoption (event) {
    event.preventDefault()
    event.stopPropagation()
    const col = this.model.collection
    col.remove( this.model )
    //this.remove()
  },
  derived: {
    value: {
      deps: ['id','label','order'],
      fn () {
        return {
          id: this.id,
          label: this.label,
          order: this.order
        }
      }
    },
    valid: {
      deps: ['id','label','order'],
      fn () {
        return Boolean( this.id && this.label && this.order )
      }
    }
  },
  update () {
    this.reportToParent()
  },
  reportToParent () {
    if (this.parent) this.parent.update(this)
  },
  beforeSubmit () {
    this.idInputView.beforeSubmit()
    this.labelInputView.beforeSubmit()
  }
})

const SelectOptionsView = View.extend({
  template: `
	  <div class="form-group">
      <label class="col-sm-3 control-label" data-hook="label">Options *</label>
      <div class="col-sm-9">
        <div>
          <ul class="list-group"></ul>
          <button data-hook="add" class="btn btn-default">
            Add Option <i class="fa fa-plus"></i>
          </button>
        </div>
      </div>
    </div>
  `,
  events: {
    'click [data-hook=add]':'onclickaddbutton'
  },
  onclickaddbutton (event) {
    event.preventDefault()
    event.stopPropagation()

    var option = new ArgumentValueOption()
    option.order = this.options.length + 1
    this.options.add(option)

    this.trigger('change:options')

    return false
  },
  props: {
    options: 'collection',
    name: ['string',false,'options'],
    validOptions: ['boolean',false,false]
  },
  initialize (options) {
    View.prototype.initialize.apply(this,arguments)
    this.options = options.value
    this.on('change:valid change:value', this.reportToParent, this);
  },
  derived: {
    hasOptions: {
      deps: ['options'],
      fn () {
        return Boolean( this.options.length > 0 )
      }
    },
    value: {
      cache: false,
      //deps: ['optionViews'],
      fn () {
        return this.optionViews.views.map(v => v.value)
      }
    },
    valid: {
      deps: ['hasOptions','validOptions'],
      fn () {
        return this.hasOptions && this.validOptions
      }
    }
  },
  bindings: {
    hasOptions: {
      type: 'toggle',
      selector: 'ul'
    }
  },
  render () {
    this.renderWithTemplate(this)
    this.optionViews = this.renderCollection(
      this.options,
      OptionView,
      this.query('ul')
    )
  },
  runTests () {
    this.validOptions = this.optionViews.views.every(view => view.valid)
  },
  update () {
    this.reportToParent()
  },
  reportToParent () {
    if (this.parent) this.parent.update(this)
  },
  beforeSubmit () {
    this.optionViews.views.forEach(opt => opt.beforeSubmit())
    this.runTests()
  },
  reset () {
    this.options.reset([])
  }
})

module.exports = FormView.extend({
  initialize (options) {
    const isNewArgument = this.model.isNew()
    this.fields = [
      { // dummy view
        el: document.createElement(`${this.model.type}-argument`),
        name: 'type',
        valid: true,
        value: this.model.type,
        render () { return '' },
        remove () { this.el.remove() }
      },
    ]

    if (this.model.type === FIELD.TYPE_FIXED) {
      this.fields.push(
        new InputView({
          label: 'Label *',
          name: 'label',
          required: true,
          invalidClass: 'text-danger',
          validityClassSelector: '.control-label',
          value: this.model.label,
        }),
        new InputView({
          label: 'Value *',
          name: 'value',
          required: true,
          invalidClass: 'text-danger',
          validityClassSelector: '.control-label',
          value: this.model.value,
        })
      )
    } else {
      let label = new InputView({
        label: 'Label *',
        name: 'label',
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: this.model.label,
      })

      let help = new InputView({
        label: 'Help',
        name: 'help',
        required: false,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: this.model.help,
      })

      this.fields.push(label)
      this.fields.push(help)

      if (this.model.type === FIELD.TYPE_SELECT) {
        let options = new SelectOptionsView({
          value: this.model.options
        })
        this.fields.push(options)
      }

      if (this.model.type === FIELD.TYPE_REMOTE_OPTIONS) {
        let endpointUrl = new InputView({
          label: 'Endpoint URL *',
          name: 'endpoint_url',
          required: true,
          invalidClass: 'text-danger',
          validityClassSelector: '.control-label',
          value: this.model.endpoint_url,
          tests: [
            function (value) {
              if (!isURL(value, {
                protocols: ['http', 'https'],
                require_protocol: true
              })) {
                return 'Must be a valid URL (include protocol)'
              }
            }
          ]
        })
        this.fields.push(endpointUrl)

        let idAttribute = new InputView({
          label: 'Value attribute *',
          name: 'id_attribute',
          required: true,
          invalidClass: 'text-danger',
          validityClassSelector: '.control-label',
          value: this.model.id_attribute
        })
        this.fields.push(idAttribute)

        let textAttribute = new InputView({
          label: 'Text attribute *',
          name: 'text_attribute',
          required: true,
          invalidClass: 'text-danger',
          validityClassSelector: '.control-label',
          value: this.model.text_attribute
        })
        this.fields.push(textAttribute)
      }
    }

    const button = new ArgumentButton({
      buttonLabel: (isNewArgument?'Add':'Update'),
      //icon: 'fa-plus'
    })
    this.fields.push(button)
    this.listenTo(button,'click',() => {
      this.submit()
    })

    FormView.prototype.initialize.apply(this, arguments)
  },
  focus () {
    let input = this.query('input')
    input.focus()
  },
  render () {
    FormView.prototype.render.apply(this, arguments)
    this.query('form').classList.add('form-horizontal')
  },
  submit (next) {
    this.beforeSubmit()
    if (!this.valid) return
    if (next) next(true)
    this.trigger('submitted')
  }
})
