import PanelButton from 'components/list/item/panel-button'
import bootbox from 'bootbox'
import App from 'ampersand-app'
import $ from 'jquery'

export default PanelButton.extend({
  initialize (options) {
    this.title = 'Delete'
    this.iconClass = 'fa fa-trash dropdown-icon'
    this.className = 'btn btn-primary'
  },
  events: {
    click: function (event) {
      event.stopPropagation()
      $('.dropdown.open .dropdown-toggle').dropdown('toggle')

      const msg = 'The File will be removed and all the information on it will be lost forever. Do you want to continue?'
      bootbox.confirm(msg, (confirmed) => {
        if (!confirmed) { return }
        App.actions.file.remove(this.model.id)
      })
    }
  }
})
