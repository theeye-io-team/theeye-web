import App from 'ampersand-app'
import DropableForm from 'components/dropable-form'
import Buttons from 'view/buttons'
import HelpIcon from 'components/help-icon'
import HelpTexts from 'language/help'
import * as FieldConstants from 'constants/field'

export default DropableForm.extend({
  initialize () {
    App.state.taskForm.form = this
    DropableForm.prototype.initialize.apply(this, arguments)
  },
  props: {
    mode: ['string', false]
  },
  focus () {
    const eles = this.queryAll('.form-control')
    if (eles.length==0) { return }
    eles[0].autofocus = true
    eles[0].focus()
  },
  addHelpIcon (field) {
    const view = this._fieldViews[field]
    if (!view) return
    view.renderSubview(
      new HelpIcon({
        text: HelpTexts.task.form[field]
      }),
      view.query('label')
    )
  },
  hasDynamicArguments () {
    return this.data.task_arguments.find(arg => {
      return arg.type && (
        arg.type === FieldConstants.TYPE_INPUT ||
        arg.type === FieldConstants.TYPE_SELECT ||
        arg.type === FieldConstants.TYPE_DATE ||
        arg.type === FieldConstants.TYPE_FILE ||
        arg.type === FieldConstants.TYPE_REMOTE_OPTIONS
      )
    })
  },
  //events: {
  //  keydown: 'onKeyEvent',
  //  keypress: 'onKeyEvent'
  //},
  //onKeyEvent (event) {
  //  if(event.target.nodeName.toUpperCase()=='INPUT') {
  //    if (event.keyCode == 13) {
  //      event.preventDefault()
  //      event.stopPropagation()
  //      return false
  //    }
  //  }
  //},
  fillForm (data) {
    if (data.task) {
      this.setWithTask(data.task)
    }
  },
  /**
   * @param {Object|Model} task
   */
  setWithTask (task) {
    Object
      .keys(this._fieldViews)
      .forEach(prop => {
        this._fieldViews[prop].setValue(task[prop])
      })
  },
  submit () {
    this.beforeSubmit()
    if (!this.valid) {
      App.state.alerts.danger('The task is not ready.', 'Complete the required fields')
      const fields = this.getInvalidFields()
      fields[0].el.scrollIntoView()
      fields[0].input?.focus()
      return
    }

    let data = this.prepareData(this.data)
    this.trigger('submit', data)
  },
  render () {
    DropableForm.prototype.render.apply(this, arguments)

    const buttons = this.buttons = new Buttons()
    this.renderSubview(buttons)
    buttons.on('click:confirm', () => { this.submit() })
  }
})
