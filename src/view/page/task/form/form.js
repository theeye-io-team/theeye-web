import FormView from 'ampersand-form-view'
import HelpIcon from 'components/help-icon'
import HelpTexts from 'language/help'
import FieldConstants from 'constants/field'

export default FormView.extend({
  focus () {
    this.query('input[name=name]').focus()
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
  events: {
    keydown: 'onKeyEvent',
    keypress: 'onKeyEvent'
  },
  onKeyEvent (event) {
    if(event.target.nodeName.toUpperCase()=='INPUT') {
      if (event.keyCode == 13) {
        event.preventDefault()
        event.stopPropagation()
        return false
      }
    }
  },
})
