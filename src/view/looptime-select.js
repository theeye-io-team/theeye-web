import App from 'ampersand-app'
import SelectView from 'components/select2-view'

export default SelectView.extend({
  initialize (options) {
    this.options = (options.looptimes || App.state.looptimes)
    this.label = (options.label || 'Check Interval (mins) *')
    this.unselectedText = (options.unselectedText || 'select the check interval')
    this.multiple = false
    this.tags = false
    this.name = 'looptime'
    this.styles = 'form-group'
    //this.idAttribute = 'email'
    //this.textAttribute = 'label'
    SelectView.prototype.initialize.apply(this,arguments)
  }
})
