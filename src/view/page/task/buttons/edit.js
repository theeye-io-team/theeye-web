import PanelButton from 'components/list/item/panel-button'
import Modalizer from 'components/modalizer'
import bootbox from 'bootbox'
import $ from 'jquery'
import EditModalizer from '../edit-modalizer'

export default PanelButton.extend({
  initialize (options) {
    this.title = `Edit`
    this.iconClass = 'fa fa-edit dropdown-icon'
    this.className = 'btn btn-primary'
  },
  events: {
    click (event) {
      event.stopPropagation()
      $('.dropdown.open .dropdown-toggle').dropdown('toggle')

      this.model.fetch({
        success: () => {
          const modal = new EditModalizer({ model: this.model })
          modal.show()
        },
        error: () => {
          bootbox.alert({
            title: 'Connection Error',
            message: `<div>An error ocurred. Please if the problem persist contact support</div>`
          })
        }
      })
    }
  }
})
