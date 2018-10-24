import App from 'ampersand-app'
import DropableForm from 'components/dropable-form'
import InputView from 'components/input-view'
import IndicatorActions from 'actions/indicator'
import SelectView from 'components/select2-view'
import HelpIcon from 'components/help-icon'
import HelpTexts from 'language/help'
import Buttons from 'view/buttons'

module.exports = DropableForm.extend({
  initialize (options) {
    const isNewTask = Boolean(this.model.isNew())

    this.fields = [
      new InputView({
        label: 'Title *',
        name: 'title',
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: this.model.title,
      }),
      new SelectView({
        label: 'Type *',
        name: '_type',
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        multiple: false,
        tags: false,
        options: App.state.indicatorTypes,
        value: this.model._type
      })
    ]

    DropableForm.prototype.initialize.apply(this, arguments)
  },
  render () {
    DropableForm.prototype.render.apply(this, arguments)

    this.query('form').classList.add('form-horizontal')

    this.addHelpIcon('title')

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
