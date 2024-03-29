import App from 'ampersand-app'
import Collection from 'ampersand-collection'
import IndicatorActions from 'actions/indicator'
import HelpTexts from 'language/help'
import Buttons from 'view/buttons'
import TagsSelectView from 'view/tags-select'
import MembersSelectView from 'view/members-select'
import SeveritySelectView from 'view/severity-select'
import HelpIcon from 'components/help-icon'
import DropableForm from 'components/dropable-form'
import InputView from 'components/input-view'
import SelectView from 'components/select2-view'
import TextareaView from 'components/input-view/textarea'
import CheckboxView from 'components/checkbox-view'
import AdvancedToggle from 'view/advanced-toggle'

import * as IndicatorConstants from 'constants/indicator'

const rowColsColCollection = new Collection([
  { id: 1 },
  { id: 2 },
  { id: 3 },
  { id: 4 },
  { id: 5 },
  { id: 6 },
  { id: 7 },
  { id: 8 },
  { id: 9 },
  { id: 10 },
  { id: 11 },
  { id: 12 }
])

export default DropableForm.extend({
  initialize (options) {
    const isNew = Boolean(this.model.isNew())

    this.advancedFields = [
      'width','height','acl',
      'description','read_only','name',
      'value', 'failure_severity', 'order'
    ]

    const typeSelect = new SelectView({
      label: 'Type *',
      enabled: isNew,
      required: true,
      name: '_type',
      invalidClass: 'text-danger',
      validityClassSelector: '.control-label',
      multiple: false,
      tags: false,
      options: App.state.indicatorTypes,
      value: this.model._type
    })

    let modelValue
    if (this.model.type === IndicatorConstants.CHART_TYPE_SHORT) {
      modelValue = JSON.stringify(this.model.value)
    } else {
      modelValue = this.model.value
    }

    this.fields = [
      new InputView({
        label: 'Title *',
        required: true,
        disabled: !isNew,
        name: 'title',
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: this.model.title,
      }),
      typeSelect,
      new SelectView({
        label: 'State',
        required: false,
        name: 'state',
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        multiple: false,
        tags: false,
        options: [
          {id: 'normal', text: 'normal'},
          {id: 'failure', text: 'failure'}
        ],
        value: this.model.state
      }),
      new TagsSelectView({
        label: 'Tags',
        required: false,
        visible: true,
        name: 'tags',
        value: this.model.tags
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
        label: 'Initial value',
        required: false,
        visible: false,
        name: 'value',
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: modelValue,
        tests: [
          (value) => {
            const type = typeSelect.value
            if (
              type === IndicatorConstants.PROGRESS_TYPE ||
              type === IndicatorConstants.COUNTER_TYPE
            ) {
              if (isNaN(Number(value))) {
                return 'Valid number requiered'
              }
            }

            if (type === IndicatorConstants.CHART_TYPE) {
              if (value === '') { return }
              try {
                JSON.parse(value)
                return
              } catch (e) {
                return 'Invalid format'
              }
            }

            if (type === IndicatorConstants.TEXT_TYPE) {
            }
          }
        ]
      }),
      new InputView({
        label: 'Order',
        required: false,
        visible: false,
        name: 'order',
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: this.model.order
      }),
      new SelectView({
        label: 'Width',
        name: 'width',
        required: false,
        visible: false,
        idAttribute: 'id',
        textAttribute: 'id',
        options: rowColsColCollection,
        value: String(this.model.width || 2)
      }),
      new SelectView({
        label: 'Height',
        name: 'height',
        required: true,
        visible: false,
        idAttribute: 'id',
        textAttribute: 'id',
        options: rowColsColCollection,
        value: String(this.model.height || 2)
      }),
      new MembersSelectView({
        label: 'ACL\'s',
        required: false,
        visible: false,
        name: 'acl',
        value: this.model.acl
      }),
      new CheckboxView({
        label: 'Read Only (Sticky)',
        required: false,
        visible: false,
        name: 'read_only',
        value: this.model.read_only
      }),
      new SeveritySelectView({
        required: false,
        visible: false,
        value: this.model.severity.toUpperCase()
      }),
      new InputView({
        label: 'Alternative Name',
        required: false,
        visible: false,
        name: 'name',
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: this.model.name,
      }),
      new TextareaView({
        label: 'More Info',
        required: false,
        visible: false,
        name: 'description',
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: this.model.description,
      }),
    ]

    DropableForm.prototype.initialize.apply(this, arguments)
  },
  render () {
    DropableForm.prototype.render.apply(this, arguments)
    this.query('form').classList.add('form-horizontal')
    this.addHelpIcon('title')
    this.addHelpIcon('_type')
    this.addHelpIcon('state')
    this.addHelpIcon('value')
    this.addHelpIcon('tags')
    this.addHelpIcon('acl')
    this.addHelpIcon('read_only')
    this.addHelpIcon('description')

    const buttons = this.buttons = new Buttons()
    this.renderSubview(buttons)
    buttons.on('click:confirm', () => { this.submit() })
  },
  submit (next) {
    next||(next=()=>{})

    this.beforeSubmit()
    if (!this.valid) { return next(null, false) }

    let data = this.prepareData(this.data)
    if (!this.model.isNew()) {
      App.actions.indicator.patch(this.model.id, data)
    } else {
      App.actions.indicator.create(data)
    }

    next(null,true)
    this.trigger('submitted')
  },
  prepareData (data) {
    const f = Object.assign({}, data)

    f["severity"] = f["failure_severity"].toLowerCase()
    f.type = f._type.replace('Indicator','').toLowerCase()

    if (
      f._type === IndicatorConstants.PROGRESS_TYPE ||
      f._type === IndicatorConstants.COUNTER_TYPE
    ) {
      f.value = Number(f.value)
    } else if (f._type === IndicatorConstants.CHART_TYPE) {
      const value = f.value || "{}"
      f.value = JSON.parse(value)
    }
    
    f['width'] = Number(f['width'])
    f['height'] = Number(f['height'])
    f['order'] = Number(f['order'])

    return f
  },
  setWithData (data) {
    this.setValues(data)
  },
  addHelpIcon (field) {
    const view = this._fieldViews[field]
    if (!view) { return }
    view.renderSubview(
      new HelpIcon({
        text: HelpTexts.task.form[field]
      }),
      view.query('label')
    )
  },
})
