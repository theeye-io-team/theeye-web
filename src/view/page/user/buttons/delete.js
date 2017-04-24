import PanelButton from 'components/list/item/panel-button'
import bootbox from 'bootbox'
import UserActions from 'actions/user'

export default PanelButton.extend({
  initialize: function (options) {
    this.title = 'delete user'
    this.iconClass = 'glyphicon glyphicon-trash'
    this.className = 'btn btn-primary deleteButton simple-btn tooltiped'
  },
  events: {
    click: function (event) {
      event.stopPropagation()
      bootbox.confirm('The user will be deleted. Do you want to continue?',
        (confirmed) => {
          if (!confirmed) { return }
          UserActions.remove(this.model.id)
        }
      )
    }
  }
})
