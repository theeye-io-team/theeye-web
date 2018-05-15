import PanelButton from 'components/list/item/panel-button'
import HostGroupActions from 'actions/hostgroup'
import bootbox from 'bootbox'

module.exports = PanelButton.extend({
  initialize: function (options) {
    this.title = 'Delete Host Template'
    this.iconClass = 'fa fa-trash'
    this.className = 'btn btn-primary'
  },
  events: {
    click: function (event) {
      event.stopPropagation()
      const msg = [
        'Hosts will be unlinked from the template and all the monitors and tasks will be removed as well.',
        'Make sure you understand what you\'re doing before you accept this action.',
        'Continue removing the template?'
      ].join('<br>')

      bootbox.confirm({
        title: 'Warning! Please, read carefully before you continue.',
        message: msg,
        buttons: {
          confirm: {
            label: 'Confirm',
            className: 'btn-danger'
          },
          cancel: {
            label: 'Cancel',
            className: 'btn-default'
          },
        },
        callback: confirm => {
          if (!confirm) { return }
          HostGroupActions.remove(this.model.id)
        }
      })
    }
  }
})
