import PanelButton from 'components/list/item/panel-button'
import bootbox from 'bootbox'
import UserActions from 'actions/user'
import $ from 'jquery'

export default PanelButton.extend({
  initialize: function (options) {
    this.title = 'Delete user'
    this.iconClass = 'fa fa-trash dropdown-icon'
    this.className = 'btn btn-primary deleteButton'
  },
  events: {
    click: function (event) {
      event.stopPropagation()
      $('.dropdown.open .dropdown-toggle').dropdown('toggle')

      bootbox.confirm('The user will be deleted. Do you want to continue?',
        (confirmed) => {
          if (!confirmed) { return }
          UserActions.remove(this.model.id)
        }
      )
    }
  }
})
