import App from 'ampersand-app'
import FormView from 'ampersand-form-view'
import View from 'ampersand-view'
import InputView from 'components/input-view'
import SelectView from 'components/select2-view'
import { RuleModel, RulesCollection } from 'models/policy'
import './style.less'

export default FormView.extend({
  initialize () {
    this.fields = [
      new InputView({
        name: 'name',
        label: 'Policy name',
        value: this.model.name,
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
      }),
      new RulesInput({
        name: 'rules',
        label: 'Rules',
        value: this.model.rules
      })
    ]
    FormView.prototype.initialize.apply(this, arguments)

    // options: App.state.rules.filter(r => r.service === this._fieldViews['service'].value)
  },
  prepareData() {
    let data = Object.assign({}, this.data)
    data.customer = App.state.session.customer.id
    return data
  }
})

const RulesInput = View.extend({
  collections: {
    rules: RulesCollection
  },
  template: `
    <div class="form-group">
      <label class="col-sm-3 control-label" data-hook="label"></label>
      <div class="col-sm-9">
        <div data-hook="container" class="policy-container"></div>
        <button data-hook="add-rule" class="btn">Add another rule</button>
      </div>
    </div>
  `,
  events: {
    'click [data-hook=add-rule]':'addRule'
  },
  props: {
    name: 'string',
    label: ['string', true, ''],
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
    this.rules.set(options.value.serialize())
  },
  render () {
    this.renderWithTemplate(this)
    this.renderCollection(
      this.rules,
      RuleView,
      this.queryByHook('container')
    )
    console.log(this)
  },
  addRule(event) {
    event.stopPropagation()
    event.preventDefault()
    let rule = new RuleModel()
    this.rules.add(rule)
  }
})

const RuleView = View.extend({
  derived: {
    value: {
      cache: false,
      fn() {
        if (this.serviceInput.value !== null && this.ruleInput.value !== null)
          return App.state.rules[this.serviceInput.value].get(this.ruleInput.value).serialize()
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
    <div class="rule-view">
      <div class="input" data-hook="service-input"></div>
      <div class="input" data-hook="rule-input"></div>
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

    this.serviceInput = new SelectView({
      name: 'service',
      placeholder: 'Service',
      label: 'Service',
      required: true,
      multiple: false, 
      options: Object.keys(App.state.rules).map(r => {
        return { id: r, text: r }
      }),
      value: this.model.service,
      template: this.inputTemplate,
      styles: null
    })
    this.ruleInput = new SelectView({
      name: 'rule',
      placeholder: 'Rule',
      label: 'Rule',
      required: true,
      multiple: false,
      options: [],
      visible: false,
      template: this.inputTemplate,
      styles: null
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
