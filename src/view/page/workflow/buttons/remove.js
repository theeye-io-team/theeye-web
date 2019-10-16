import App from 'ampersand-app'
import bootbox from 'bootbox'
import PanelButton from 'components/list/item/panel-button'
import $ from 'jquery'

module.exports = PanelButton.extend({
  initialize (options) {
    this.title = 'Remove workflow'
    this.iconClass = 'fa fa-trash dropdown-icon'
    this.className = 'btn btn-primary'
  },
  events: {
    click (event) {
      event.stopPropagation()
      $('.dropdown.open .dropdown-toggle').dropdown('toggle')

      bootbox.confirm({
        title: 'Confirm Workflow removal',
        message: 'Remove the workflow and release tasks from it?',
        backdrop: true,
        buttons: {
          confirm: {
            label: 'Yes, please',
            className: 'btn-danger'
          },
          cancel: {
            label: 'I\m not sure',
            className: 'btn-default'
          }
        },
        callback: (confirmed) => {
          if (confirmed===true) {
            App.actions.workflow.remove(this.model.id)
          }
        }
      })
    }
  }
})
