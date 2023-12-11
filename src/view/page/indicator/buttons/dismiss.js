import ButtonView from 'components/list/item/panel-button'
import IndicatorActions from 'actions/indicator'

export default ButtonView.extend({
  initialize (options) {
    this.title = 'Delete'
    this.className = (options && options.className) || 'btn btn-primary'
    this.iconClass = 'fa fa-trash-o dropdown-icon'
  },
  bindings: Object.assign({}, ButtonView.prototype.bindings, {
    'model.read_only': {
      type: 'booleanAttribute',
      name: 'disabled',
      selector: 'button'
    }
  }),
  events: {
    'click':'onClick'
  },
  onClick (event) {
    event.preventDefault()
    event.stopPropagation()
    if (this.model.read_only === true) {
      return false
    }
    IndicatorActions.remove(this.model.id)
    return false
  }
})
