'use strict'

import PanelButton from 'components/list/item/panel-button'
import EditView from '../edit'

export default PanelButton.extend({
  initialize (options) {
    this.title = 'Edit Monitor'
    this.tip = 'Edit Monitor'
    this.iconClass = 'fa fa-edit'
    this.className = 'btn btn-primary'
  },
  events: {
    click (event) {
      event.stopPropagation()
      event.preventDefault()
      new EditView (this.model)
      return false
    }
  }
})
