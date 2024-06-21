import App from 'ampersand-app'
import State from 'ampersand-state'
import FilteredCollection from 'ampersand-filtered-subcollection'
import View from 'ampersand-view'
import SelectView from 'components/select2-view'
import FileForm from 'view/page/files/form'
import Modalizer from 'components/modalizer'
import { Model as ScriptModel } from 'models/file/script'
import OnboardingActions from 'actions/onboarding'

export default SelectView.extend({
  template: `
    <div>
      <div>
        <label data-hook="label" class="col-sm-3 control-label"></label>
        <div class="col-sm-6">
          <select class="form-control select" style="width:100%"></select>
          <div data-hook="message-container" class="message message-below message-error">
            <p data-hook="message-text"></p>
          </div>
        </div>
      </div>
      <div class="col-sm-3">
        <button data-hook="mode-button" class="btn btn-block btn-primary">Search Event</button>
      </div>
    </div>
  `,
  initialize (options) {
    let filters = [ item => item.displayable == true ]
    if (Array.isArray(options.filterOptions) && options.filterOptions.length) {
      filters = filters.concat(options.filterOptions)
    }

    this.options = new FilteredCollection(App.state.events, { filters })
    this.multiple = true 
    this.tags = true
    this.label = options.label || 'Emitters'
    this.name = options.name || 'emitters'
    this.styles = 'form-group'
    this.unselectedText = 'select event emitters'
    this.idAttribute = 'id'
    this.textAttribute = 'summary'

    this.allowCreateTags = false
    this.allowClear = true
    this.requiredMessage = 'Selection required'
    this.invalidClass = 'text-danger'
    this.validityClassSelector = '.control-label'

    SelectView.prototype.initialize.apply(this,arguments)
  },
  //render () {
  //  SelectView.prototype.render.apply(this,arguments)
  //  this.listenToAndRun(this,'change:value', () => {
  //    let btnTxt = (!this.value) ? 'Create Script' : 'Update Script'
  //    this.queryByHook('mode-button').innerHTML = btnTxt
  //  })
  //},
  events: {
    'click button[data-hook=mode-button]':'onClickModeButton'
  },
  onClickModeButton (event) {
    event.preventDefault()
    event.stopPropagation()

    const emitterView = new EmitterView({
      model: new EventProps()
    })

    const modal = new Modalizer({
      buttons: true,
      title: 'Select the trigger',
      bodyView: emitterView
    })

    this.listenTo(modal, 'hidden', () => {
      emitterView.remove()
      modal.remove()
    })

    this.listenTo(modal, 'confirm', () => {
      emitterView.beforeSubmit()
      if (!emitterView.valid) { return }

      const selections = this.value
      App.actions.events
        .create(emitterView.value)
        .then(ev => {
          if (!ev?.id) {
            return
          }

          selections.push(ev.id)
          this.renderSelect2Component(selections)
        })
      modal.hide()
    })

    //this.listenTo(emitterView, 'change:value', () => {
    //  const task = App.state.tasks.get(emitterView.value)
    //  this.setValue(task.env)
    //})

    modal.show()
    return false
  }
})

const EmitterView = View.extend({
  template: `
    <div>
      <div class="" style="">
        <span class="col-xs-4">Type</span>
        <span class="col-xs-4">Emitter</span>
        <span class="col-xs-4">Event Name</span>
      </div>
      <div class="" style="">
        <span class="col-xs-4" data-hook="type"></span>
        <span class="col-xs-4" data-hook="emitter_id"></span>
        <span class="col-xs-4" data-hook="event_name"></span>
      </div>
    </div>
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
  //update () {
  //  this.reportToParent()
  //},
  //reportToParent () {
  //  if (this.parent) { this.parent.update(this) }
  //},
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

const EventProps = State.extend({
  props: {
    id: 'number',
    type: 'string',
    emitter_id: 'string',
    event_name: 'string',
    value: 'any'
  }
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
