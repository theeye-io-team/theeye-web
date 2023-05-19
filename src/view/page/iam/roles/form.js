import App from 'ampersand-app'
import FormView from 'ampersand-form-view'
import View from 'ampersand-view'
import InputView from 'components/input-view'
import SelectView from 'components/select2-view'
import { Action, ActionsCollection } from 'models/iam'
import './style.less'

export default FormView.extend({
  props: {
    readonly: ['boolean', true, false]
  },
  initialize () {
    this.fields = [
      new InputView({
        name: 'name',
        label: 'Role name',
        value: this.model.name,
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        readonly: this.readonly
      }),
      new ActionsInput({
        name: 'actions',
        label: 'Actions',
        value: this.model.actions,
        readonly: this.readonly,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label'
      })
    ]
    FormView.prototype.initialize.apply(this, arguments)
  },
  prepareData () {
    let data = Object.assign({}, this.data)
    data.customer = App.state.session.customer.id
    return data
  }
})

const ActionsInput = View.extend({
  collections: {
    actions: ActionsCollection
  },
  template: `
    <div class="form-group">
      <label class="col-sm-3 control-label" data-hook="label"></label>
      <div class="col-sm-9">
        <div data-hook="container" class="policy-container"></div>
        <button data-hook="add-action" class="btn">Add another action</button>
      </div>
    </div>
  `,
  events: {
    'click [data-hook=add-action]':'addAction'
  },
  props: {
    name: 'string',
    label: ['string', true, ''],
    readonly: ['boolean', true, false]
  },
  bindings: {
    'label': [
      {
        hook: 'label'
      },
      {
        type: 'toggle',
        hook: 'label'
      }
    ],
    'readonly': {
      type: 'toggle',
      hook: 'add-action',
      invert: true
    }
  },
  derived: {
    value: {
      cache: false,
      fn() {
        return this._subviews[0].views.map(v => v.value)
      } 
    },
    valid: {
      cache: false,
      fn() {
        return !(this._subviews[0].views.map(v => v.valid).includes(false))
      }
    }
  },
  initialize (options) {
    View.prototype.initialize.apply(this, arguments)
    this.actions.set(options.value.serialize())
  },
  render () {
    this.renderWithTemplate(this)
    this.renderCollection(
      this.actions,
      ActionView,
      this.queryByHook('container'),
      {
        viewOptions: {
          readonly: this.readonly
        }
      }
    )
    console.log(this)
  },
  addAction(event) {
    event.stopPropagation()
    event.preventDefault()
    this.actions.add(new Action())
  }
})

const ActionView = View.extend({
  props: {
    readonly: ['boolean', true, false]
  },
  derived: {
    value: {
      cache: false,
      fn () {
        if (this.serviceInput.value !== null && this.ruleInput.value !== null) {
          return App.state
            .rules[this.serviceInput.value]
            .get(this.ruleInput.value)
            .serialize()
        }
      }
    },
    valid: {
      cache: false,
      fn() {
        return (this.serviceInput.value !== null && this.ruleInput.value !== null)
      }
    }
  },
  template: `
    <div class="action-view">
      <div class="input" data-hook="service-input"></div>
      <div class="input" data-hook="action-input"></div>
    </div>
  `,
  inputTemplate: `
    <div>
      <p class="label" data-hook="label"></p>
      <select class="form-control select" style="width:100%"></select>
      <div data-hook="message-container" class="message message-below message-error">
        <p data-hook="message-text"></p>
      </div>
    </div>
  `,
  initialize (options) {
    View.prototype.initialize.apply(this, arguments)
  },
  render () {
    this.renderWithTemplate(this)

    console.log(this.readonly)

    this.serviceInput = new SelectView({
      name: 'service',
      placeholder: 'Service',
      label: 'Service',
      required: true,
      multiple: false, 
      options: Object.keys(App.state.supcatalog).map(r => {
        return { id: r, text: r }
      }),
      value: this.model.service,
      template: this.inputTemplate,
      styles: null,
      enabled: !this.readonly,
      invalidClass: 'text-danger',
      validityClassSelector: '.control-label'
    })
    this.ruleInput = new SelectView({
      name: 'action',
      placeholder: 'Action',
      label: 'Action',
      required: true,
      multiple: false,
      options: [],
      visible: false,
      template: this.inputTemplate,
      styles: null,
      enabled: !this.readonly,
      invalidClass: 'text-danger',
      validityClassSelector: '.control-label'
    })

    this.serviceInput.on('change:value', () => {
      this.ruleInput.options = App.state.rules[this.serviceInput.value]
        .serialize()
        .map(r => {
          return { id: r.id, text: r.text }
        })
        if (this.ruleInput.value === null)
          this.ruleInput.setValue(this.model.id)
        else
          this.ruleInput.setValue(null)
        this.ruleInput.visible = true
    })

    this.renderSubview(
      this.serviceInput,
      this.queryByHook('service-input')
    )

    this.renderSubview(
      this.ruleInput,
      this.queryByHook('rule-input')
    )
  }
})
