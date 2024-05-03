import App from 'ampersand-app'
import View from 'ampersand-view'
import Collection from 'ampersand-collection'
import InputView from 'components/input-view'
import SelectView from 'components/select2-view'

import State from 'ampersand-state'
import Modalizer from 'components/modalizer'
import TaskSelection from 'view/task-select'
import FileSaver from 'file-saver'
import './styles.less'

const EventProps = State.extend({
  props: {
    id: 'number',
    type: 'string',
    emitter_id: 'string',
    event_name: 'string',
    value: 'any'
  }
})
const EventCollection = Collection.extend({
  indexes: ['id', 'type', 'value', 'emitter_id','event_name'],
  model: State.extend({
    props: {
      id: 'number',
      type: 'string',
      emitter_id: 'string',
      event_name: 'string',
      value: 'any'
    }
  }),
  /**
   * Convert an Object of { key: value } into and Array [ { key, value } ]
   *
   * @param {Object} models
   */
  reset (models) {
    const values = []
    if (Array.isArray(models)) {
      return Collection.prototype.reset.call(this, models)
    } else {
      // remap into array
      for (let key in models) {
        const elem = {}
        elem["key"] = key
        elem["value"] = models[key]
        values.push(elem)
      }

      return Collection.prototype.reset.call(this, values)
    }
  }
})

export default View.extend({
  template: `
    <div class="form-group" data-component="emitters-view-component">
      <label class="col-sm-3 control-label" data-hook="label">
      </label>
      <div class="col-sm-9">
        <div>
          <button data-hook="add" class="btn btn-default">
            Add <i class="fa fa-plus"></i>
          </button>
          <button data-hook="copy"
            title="copy from"
            class="btn btn-default">
              Copy <i class="fa fa-copy"></i>
          </button>
          <button data-hook="export"
            title="export to json"
            class="btn btn-default">
              Export <i class="fa fa-download"></i>
          </button>
          <ul data-hook="list-group" class="list-group"></ul>
        </div>
      </div>
    </div>
  `,
  props: {
    outputFormat: ['string', false, 'object'],
    label: ['string',false,'Emitters'],
    name: ['string',false,'emitters'],
    required: ['boolean', false, false],
    visible: ['boolean', false, true],
    values: ['object', true, () => { return {} }],
    validValues: ['boolean', false],
    variablesLength: ['number', false, 0],
    copyButton: ['boolean', false, true],
    exportButton: ['boolean', false, true],
  },
  collections: {
    constants: EventCollection
  },
  initialize (options) {
    View.prototype.initialize.apply(this, arguments)
    this.setValue(this.values)
    this.on('change:valid change:value', this.reportToParent, this)

    this.constants.on('add remove reset sync', () => {
      this.variablesLength = this.constants.length
    })
    this.variablesLength = this.constants.length
  },
  derived: {
    hasVariables: {
      deps: ['variablesLength'],
      fn () {
        return Boolean(this.variablesLength > 0)
      }
    },
    value: {
      cache: false,
      fn () {
        const values = this.variableViews.views.map(v => v.value)
        return values
      }
    },
    valid: {
      deps: ['validValues'],
      fn () {
        return this.validValues
      }
    }
  },
  bindings: {
    hasVariables: {
      hook: 'list-group',
      type: 'toggle',
    },
    copyButton: {
      hook: 'copy',
      type: 'toggle',
    },
    exportButton: {
      hook: 'export',
      type: 'toggle',
    },
    label: {
      hook: 'label'
    },
    visible: {
      type: 'toggle'
    }
  },
  events: {
    'click [data-hook=add]': 'onClickAdd',
    'click [data-hook=copy]': 'onClickCopyFrom',
    'click [data-hook=export]': 'onClickExport',
  },
  onClickAdd (event) {
    event.preventDefault()
    event.stopPropagation()

    const emitterView = new EmitterView({
      model: new EventProps()
    })

    const modal = new Modalizer({
      buttons: false,
      title: 'Copy Environment from',
      bodyView: emitterView
    })

    this.listenTo(modal,'hidden',() => {
      emitterView.remove()
      modal.remove()
    })

    this.listenTo(emitterView, 'change:value', () => {
      //const task = App.state.tasks.get(emitterView.value)
      //this.setValue(task.env)
    })

    modal.show()
    return false
  },
  onClickExport (event) {
    event.preventDefault()
    event.stopPropagation()

    const envs = []
    for (let prop in this.value) {
      envs.push(`${prop} = "${this.value[prop]}"`)
    }
    const blob = new Blob([ envs.join('\n') ], { type: 'text/plain' })
    const fileName = this.parent.model?.name?.replace(/ /g, '_')
    FileSaver.saveAs(blob, `${fileName}.env`)
  },
  onClickCopyFrom (event) {
    event.preventDefault()
    event.stopPropagation()

    const selectView = new TaskSelection({
      filterOptions: [
        item => item.env && Object.keys(item.env).length > 0
      ]
    })

    const modal = new Modalizer({
      buttons: false,
      title: 'Copy Environment from',
      bodyView: selectView
    })

    this.listenTo(modal,'hidden',() => {
      selectView.remove()
      modal.remove()
    })

    this.listenTo(selectView, 'change:value', () => {
      const task = App.state.tasks.get(selectView.value)
      this.setValue(task.env)
    })

    modal.show()
    return false
  },
  setValue (values) {
    // need an object with key , values
    if (this.outputFormat === 'array') {
      // we need to remap the array of maps into a map
      const vmap = []
      values.forEach((el, index) => {
        if (typeof el === 'string') {
          vmap.push({ id: index, key: index, value: el })
        } else {
          // internal key, value representation
          vmap.push({ id: index, key: el.k, value: el.v })
        }
      })

      this.constants.reset(vmap)
    } else {
      this.constants.reset(values)
    }
  },
  render () {
    this.renderWithTemplate(this)

    const collVu = this.variableViews = this.renderCollection(
      this.constants,
      EmitterView,
      this.queryByHook('list-group')
    )

    collVu.collection.on('add', child => {
      const view = collVu.views.find(vu => vu.model === child)
      //view.typeView.input.focus()
    })
  },
  //update () {
  //  this.reportToParent()
  //},
  //reportToParent () {
  //  if (this.parent) { this.parent.update(this) }
  //},
  beforeSubmit () {
    this.variableViews.views.forEach(vu => vu.beforeSubmit())
    this.runTests()
  },
  runTests () {
    if (this.variableViews.views.length === 0) {
      this.validValues = true
      return
    }

    this.validValues = this.variableViews.views.every(view => view.valid)
  }
})

const EmitterView = View.extend({
  template: `
    <li class="list-group-item">
      <div class="" style="">
        <span class="col-xs-4" data-hook="type"></span>
        <span class="col-xs-4" data-hook="emitter_id"></span>
        <span class="col-xs-4" data-hook="event_name"></span>
      </div>
      <div class="" style="">
        <span class="form-group">
          <button data-hook="remove-option" class="btn btn-default">
            <i class="fa fa-trash"></i>
          </button>
          <button data-hook="add-option" class="btn btn-default">
            <i class="fa fa-plus"></i>
          </button>
        </span>
      </div>
    </li>
  `,
  initialize () {
    View.prototype.initialize.apply(this,arguments)
    this.updateState(this.model)
    //this.on('change:valid change:value', this.reportToParent, this)
  },
  updateState (state) {
    this.type = state.type
    this.emitter_id = state.emitter_id
    this.event_name = state.event_name
  },
  props: {
    type: 'string',
    emitter_id: 'string',
    event_name: 'string',
    name: ['string', false, 'env_var'] // my input name
  },
  derived: {
    value: {
      deps: ['type', 'emitter_id', 'event_name'],
      fn () {
        const { type, emitter_id, event_name } = this
        return { type, emitter_id, event_name }
      }
    },
    valid: {
      deps: ['type', 'emitter_id', 'event_name'],
      fn () {
        const { type, emitter_id, event_name } = this
        // cannot be empty
        return (type && emitter_id && event_name)
      }
    }
  },
  events: {
    'click [data-hook=remove-option]': 'onClickRemoveButton',
    'click [data-hook=add-option]': 'onClickAddButton'
  },
  onClickRemoveButton (event) {
    event.preventDefault()
    event.stopPropagation()
    // mmmmm...
    this.model.collection.remove(this.model)
  },
  async onClickAddButton (event) {
    event.preventDefault()
    event.stopPropagation()
    //this.model.collection.remove(this.model)
    const { type, emitter_id, event_name } = this
    const emitter = await App.actions
      .events.create({ type, emitter_id, event_name })
  },
  render () {
    this.renderWithTemplate(this)

    const typeView = this.renderTypesView()
    const emitterView = this.renderEmittersView()
    const eventNameView = this.renderEvenNameView()

    this.on('change:type', async (eve) => {
      const emitters = await App.actions.events.fetchEmitters(this.type)
      emitterView.options = emitters[this.type]
      eventNameView.options = []
    })
    this.on('change:emitter_id', async (eve) => {
      const events = await App.actions.events.getEmitterEvents(this.type, this.emitter_id)
      eventNameView.options = events
    })
  },
  renderTypesView () {
    const type = this.model.type
    const view = this.typeView = new EmitterTypeSelect({
      name: 'type',
      value: type,
      placeholder: 'Emitter Type',
      invalidClass: 'text-danger',
      validityClassSelector: 'p[data-hook=message-text]',
      required: true
    })
    this.renderSubview(view, this.queryByHook('type'))
    this.listenTo(view, 'change:valid', this.validityCheck)
    // use internal state
    this.listenTo(view, 'change:value', () => {
      this.type = view.value
    })
    return view 
  },
  renderEmittersView () {
    const emitter_id = this.model.emitter_id
    const view = this.emitterView = new EmitterSelect({
      name: 'emitter_id',
      value: emitter_id,
      placeholder: 'Event Emitter',
      invalidClass: 'text-danger',
      validityClassSelector: 'p[data-hook=message-text]',
      required: true
    })
    this.renderSubview(view, this.queryByHook('emitter_id'))
    this.listenTo(view, 'change:valid', this.validityCheck)
    // use internal state
    this.listenTo(view, 'change:value', () => {
      this.emitter_id = view.value
    })
    return view
  },
  renderEvenNameView () {
    const event_name = this.model.event_name
    const view = this.eventNameView = new EventNameSelect({
      name: 'event_name',
      value: event_name,
      placeholder: 'Event Name',
      invalidClass: 'text-danger',
      validityClassSelector: 'p[data-hook=message-text]',
      required: true
    })
    this.renderSubview(view, this.queryByHook('event_name'))
    this.listenTo(view, 'change:valid', this.validityCheck)
    // use internal state
    this.listenTo(view, 'change:value', () => {
      this.event_name = view.value
    })
    return view
  },
  update () {
    this.reportToParent()
  },
  reportToParent () {
    if (this.parent) { this.parent.update(this) }
  },
  beforeSubmit () {
    this.typeView.beforeSubmit()
    this.emitterView.beforeSubmit()
    this.eventNameView.beforeSubmit()
    this.validityCheck()
  },
  validityCheck () {
    const type = this.typeView
    const emitter = this.emitterView
    const eventName = this.eventNameView

    if (!type.valid || !emitter.valid || !eventName.valid) {
      this.el.classList.add('box-danger')
    } else {
      this.el.classList.remove('box-danger')
    }
  }
})

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

const CustomSelectView = SelectView.extend({
  template: `
    <div data-component="select2-view">
      <label data-hook="label" style="display:none; visibility:hidden;"></label>
      <div>
        <select class="form-control select" style="width:100%"></select>
        <div data-hook="message-container" class="message message-below message-error">
          <p data-hook="message-text"></p>
        </div>
      </div>
    </div>
  `
})

const EmitterTypeSelect = CustomSelectView.extend({
  initialize (options = {}) {
    this.options = [
      { id: 'indicator', name: 'Indicator' },
      { id: 'monitor', name: 'Monitor' },
      { id: 'task', name: 'Task' },
      { id: 'webhook', name: 'Webhook' }, 
      //{ id: 'workflow', name: 'Workflow' }, 
    ]

    this.visible = true
    //this.label = options.label || 'Event Emitters'
    this.name = options.name || 'emitters'
    this.styles = 'form-group'
    this.unselectedText = 'Select the event emitter category'
    this.idAttribute = 'id'
    this.textAttribute = 'name'

    CustomSelectView.prototype.initialize.apply(this,arguments)
  }
})

const EmitterSelect = CustomSelectView.extend({
  initialize (options = {}) {
    this.options = [ ]

    this.visible = true
    this.name = options.name || 'emitter_id'
    this.styles = 'form-group'
    this.unselectedText = 'Select the event emitter'
    this.idAttribute = 'id'
    this.textAttribute = (attrs) => {
      const type = attrs.type ? `${attrs.type.toUpperCase()} -` : ''
      const label = (attrs.title||attrs.name)
      const tags = attrs.tags?.length ? ` [${attrs.tags}]` : ''
      return `${type} ${label} ${tags}`
    }

    CustomSelectView.prototype.initialize.apply(this,arguments)
  }
})

const EventNameSelect = CustomSelectView.extend({
  initialize (options = {}) {
    this.options = [ ]

    this.visible = true
    this.name = options.name || 'event_name'
    this.styles = 'form-group'
    this.unselectedText = 'Select the event name'
    this.idAttribute = 'name'
    this.textAttribute = 'label'

    CustomSelectView.prototype.initialize.apply(this,arguments)
  }
})
