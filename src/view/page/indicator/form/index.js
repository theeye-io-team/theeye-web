import App from 'ampersand-app'
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

import IndicatorConstants from 'constants/indicator'

module.exports = DropableForm.extend({
  initialize (options) {
    //const isNewTask = Boolean(this.model.isNew())


    this.advancedFields = ['acl','tags','description','read_only','value']

    this.fields = [
      new InputView({
        label: 'Title *',
        required: true,
        name: 'title',
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: this.model.title,
      }),
      new SelectView({
        label: 'Type *',
        required: true,
        name: '_type',
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        multiple: false,
        tags: false,
        options: App.state.indicatorTypes,
        value: this.model._type
      }),
      // advanced fields starts visible = false
      new AdvancedToggle({
        onclick: (event) => {
          this.advancedFields.forEach(name => {
            this._fieldViews[name].toggle('visible')
          })
        }
      }),
      new InputView({
        label: 'Initial value',
        required: false,
        visible: false,
        name: 'value',
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: this.model.value,
      }),
      new TagsSelectView({
        label: 'Tags',
        required: false,
        visible: false,
        name: 'tags',
        value: this.model.tags
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
      App.actions.indicator.update(this.model.id, data)
    } else {
      App.actions.indicator.create(data)
    }

    next(null,true)
    this.trigger('submitted')
  },
  prepareData (data) {
    let f = Object.assign({}, data)
    f.type = f._type.replace('Indicator','').toLowerCase()

    if (
      f._type === IndicatorConstants.PROGRESS_TYPE ||
      f._type === IndicatorConstants.COUNTER_TYPE
    ) {
      f.value = Number(f.value)
    }

    return f
  },
  setWithData (data) {
    this.setValues({
      title: data.title
    })
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
