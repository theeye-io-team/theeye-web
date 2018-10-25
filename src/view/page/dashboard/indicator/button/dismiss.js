import ButtonView from 'components/list/item/panel-button'
import IndicatorActions from 'actions/indicator'

module.exports = ButtonView.extend({
  initialize (options) {
    this.title = 'Dismiss'
    this.className = (options && options.className) || 'btn btn-primary'
    this.iconClass = 'fa fa-trash-o'
  },
  events: {
    'click':'onClick'
  },
  onClick (event) {
    event.preventDefault()
    event.stopPropagation()
    IndicatorActions.remove(this.model.id)
    return false
  }
})
