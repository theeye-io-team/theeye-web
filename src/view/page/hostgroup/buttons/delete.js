import App from 'ampersand-app'
import PanelButton from 'components/list/item/panel-button'
import HostGroupActions from 'actions/hostgroup'
import bootbox from 'bootbox'
const confirmTemplate = require('./deleteConfirm.hbs')

module.exports = PanelButton.extend({
  initialize: function (options) {
    this.title = 'Delete Host Template'
    this.iconClass = 'fa fa-trash'
    this.className = 'btn btn-primary'
  },
  events: {
    click: function (event) {
      var self = this
      event.stopPropagation()

      bootbox.confirm({
        title: 'Delete template',
        message:'Are you sure you want to delete this template?',
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

          var msg = confirmTemplate({
            hosts: this.model.hosts.models.map(i => {
              if(!i.hostname) {
                var host = App.state.hosts.get(i.id)
                return host.hostname
              } else {
                return i.hostname
              }
            })
          })

          bootbox.dialog({
            title: 'Warning! Please, read carefully before you continue.',
            message: msg,
            buttons: {
              no: {
                label: 'NO',
                className: 'btn-default',
                callback: function() {
                  HostGroupActions.remove(self.model.id, false)
                }
              },
              yes: {
                label: 'YES',
                className: 'btn-danger',
                callback: function() {
                  HostGroupActions.remove(self.model.id, true)
                }
              }
            }
          })
        }
      })
    }
  }
})
