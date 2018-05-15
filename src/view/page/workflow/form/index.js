import App from 'ampersand-app'
import AdvancedToggle from 'view/advanced-toggle'
import FormView from 'ampersand-form-view'
import FormButtons from 'view/buttons'
import SelectView from 'components/select2-view'
import InputView from 'components/input-view'
import TextareaView from 'components/input-view/textarea'
import TagsSelectView from 'view/tags-select'
import MembersSelectView from 'view/members-select'
import HelpIcon from 'components/help-icon'
const HelpTexts = require('language/help')
import WorkflowActions from 'actions/workflow'
import WorkflowBuilder from './workflow-builder'
import assign from 'lodash/assign'
import EventsSelectView from 'view/events-select'

export default FormView.extend({
  initialize (options) {
    const isNew = Boolean(this.model.isNew())

    this.advancedFields = [
      'acl',
      'tags',
      'description'
    ]

    this.fields = [
      new InputView({
        label: 'Name *',
        name: 'name',
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: this.model.name,
      }),
      new EventsSelectView({
        label: 'Triggered by',
        name: 'triggers',
        visible: true,
        value: this.model.triggers
      }),
      new WorkflowBuilder({
        name: 'graph',
        value: this.model.graph
      }),
      // advanced fields starts visible = false
      new AdvancedToggle({
        onclick: (event) => {
          this.advancedFields.forEach(name => {
            this._fieldViews[name].toggle('visible')
          })
        }
      }),
      new TextareaView({
        visible: false,
        label: 'More Info',
        name: 'description',
        required: false,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: this.model.description,
      }),
      new TagsSelectView({
        required: false,
        visible: false,
        name: 'tags',
        value: this.model.tags
      }),
      new MembersSelectView({
        required: false,
        visible: false,
        name: 'acl',
        label: 'ACL\'s',
        value: this.model.acl
      })
    ]

    FormView.prototype.initialize.apply(this, arguments)
  },
  focus () {
    this.query('input[name=name]').focus()
  },
  render () {
    FormView.prototype.render.apply(this, arguments)
    this.query('form').classList.add('form-horizontal')

    this.addHelpIcon('name')
    this.addHelpIcon('description')
    this.addHelpIcon('tags')
    this.addHelpIcon('acl')

    const buttons = new FormButtons()
    this.renderSubview(buttons)
    buttons.on('click:confirm', () => { this.submit() })
  },
  addHelpIcon (field) {
    const view = this._fieldViews[field]
    if (!view) return
    view.renderSubview(
      new HelpIcon({
        text: HelpTexts.monitor[field]
      }),
      view.query('label')
    )
  },
  remove () {
    FormView.prototype.remove.apply(this)
  },
  submit (next) {
    next||(next=()=>{})

    this.beforeSubmit()
    if (!this.valid) {
      // cancel submit
      return next(null,false)
    }

    // id property is the required value, with "numeric" data type

    let data = this.prepareData(this.data)
    //data.looptime = this._fieldViews.looptime.selected().id
    if (!this.model.isNew()) {
      WorkflowActions.update(this.model.id, data)
    } else {
      WorkflowActions.create(data)
    }

    this.trigger('submitted')
    next(null,true)
  },
  prepareData (data) {
    let f = assign({}, data)
    f.first_task_id = this._fieldViews.graph.firstTask.id
    f.last_task_id = this._fieldViews.graph.lastTask.id
    delete f['advanced-toggler']
    return f
  }
})
