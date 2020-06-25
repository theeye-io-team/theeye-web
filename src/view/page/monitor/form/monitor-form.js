import App from 'ampersand-app'
import DropableForm from 'components/dropable-form'
//import MonitorActions from 'actions/monitor'
import HelpIcon from 'components/help-icon'
import HelpTexts from 'language/help'

export default DropableForm.extend({
  addHelpIcon (field) {
    const view = this._fieldViews[field]
    if (!view) { return }
    view.renderSubview(
      new HelpIcon({
        text: HelpTexts.monitor.form[field]
      }),
      view.query('label')
    )
  },
  submit (next) {
    next||(next=()=>{})
    this.beforeSubmit()
    if (!this.valid) {
      // cancel submit
      return next(null, false)
    }
    let data = this.prepareData(this.data)
    if (!this.model.isNew()) {
      App.actions.resource.update(this.model.id, data)
    } else {
      if (data.type === 'nested') {
        App.actions.resource.create(data)
      } else {
        App.actions.resource.createMany(data)
      }
    }
    this.trigger('submitted')
    next(null,true)
  }
})
