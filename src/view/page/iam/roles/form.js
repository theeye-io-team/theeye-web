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
  },
  render () {
    FormView.prototype.render.apply(this, arguments)
    this.query('form').classList.add('form-horizontal')
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
        <button data-hook="add-action" class="btn">
          <i class="fa fa-plus"></i>Add action
        </button>
        <div data-hook="container" class="policy-container"></div>
      </div>
    </div>
  `,
  events: {
    'click [data-hook=add-action]':'onAddAction'
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
  onAddAction(event) {
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
        return {
          service: this.serviceInput?.value,
          action: this.ruleInput?.value
        }
      }
    },
    valid: {
      cache: false,
      fn () {
        return (this.serviceInput.value !== null && this.ruleInput.value !== null)
      }
    }
  },
  template: `
    <div class="row action-view">
      <div class="col-sm-6 input" data-hook="service-input"></div>
      <div class="col-sm-6 input" data-hook="rule-input"></div>
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
      options: App.state.supcatalog.map(serv => {
        return { text: ucfirst(serv.name), id: serv.name }
      }),
      value: this.model.service,
      template: inputTemplate,
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
      //visible: false,
      template: inputTemplate,
      styles: null,
      enabled: !this.readonly,
      invalidClass: 'text-danger',
      validityClassSelector: '.control-label'
    })

    this.serviceInput.on('change:value', () => {
      const serviceName = this.serviceInput.value
      const service = App.state.supcatalog
        .models
        .find(c => c.name === serviceName)

      this.ruleInput.options = service.actions.map(a => {
        const key = `${a.method}_${a.path}`
        return { text: a.name || key, id: key }
      })

      if (this.ruleInput.value === null) {
        this.ruleInput.setValue(this.model.id)
      } else {
        this.ruleInput.setValue(null)
      }
      this.ruleInput.visible = true
    })

    this.renderSubview(this.serviceInput, this.queryByHook('service-input'))
    this.renderSubview(this.ruleInput, this.queryByHook('rule-input'))
  }
})

const inputTemplate = `
  <div>
    <p class="label" data-hook="label"></p>
    <select class="form-control select" style="width:100%"></select>
    <div data-hook="message-container" class="message message-below message-error">
      <p data-hook="message-text"></p>
    </div>
  </div>
`
const ucfirst = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
