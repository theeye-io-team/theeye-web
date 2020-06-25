import App from 'ampersand-app'
import PanelButton from 'components/list/item/panel-button'
import HostGroupActions from 'actions/hostgroup'
import bootbox from 'bootbox'
import $ from 'jquery'

export default PanelButton.extend({
  initialize: function (options) {
    this.title = 'Delete template'
    this.iconClass = 'fa fa-trash dropdown-icon'
    this.className = 'btn btn-primary'
  },
  deleteTemplateDialog () {

    const model = this.model

    const confirmUnlinkDestinationHosts = () => {
      const msg = unlinkMessage({
        hostnames: model.hosts.models.map(i => {
          if (!i.hostname) {
            let host = App.state.hosts.get(i.id)
            return host.hostname
          } else {
            return i.hostname
          }
        })
      })

      bootbox.dialog({
        title: 'Warning! This template has destination Bots.',
        message: msg,
        buttons: {
          no: {
            label: 'NO',
            className: 'btn-default',
            callback: function () {
              HostGroupActions.remove(model.id, false)
            }
          },
          yes: {
            label: 'YES',
            className: 'btn-danger',
            callback: function () {
              HostGroupActions.remove(model.id, true)
            }
          },
          cancel: {
            label: 'CANCEL',
            className: 'btn-primary'
          }
        }
      })
    }

    const onConfirmDelete = () => {
      if (model.hosts.models.length>0) {
        confirmUnlinkDestinationHosts()
      } else {
        HostGroupActions.remove(model.id, false)
      }
    }

    bootbox.dialog({
      title: 'Delete template',
      message:'Are you sure you want to delete this template?',
      buttons: {
        confirm: {
          label: 'Confirm',
          className: 'btn-danger',
          callback: function () {
            onConfirmDelete()
          }
        },
        cancel: {
          label: 'Cancel',
          className: 'btn-default'
        }
      }
    })
  },
  events: {
    click: function (event) {
      event.stopPropagation()
      event.preventDefault()
      $('.dropdown.open .dropdown-toggle').dropdown('toggle')

      this.deleteTemplateDialog()
    }
  }
})

const unlinkMessage = (opts) => {
  let hostnames = opts.hostnames
  let names = hostnames.map(name => `<strong>${name}</strong><br />`)

  let html = `
    <p style="padding-top:15px">Remove template monitors and tasks from the following destination Bots?</p>
    ${names}
    <br />
    <p><b>NO:</b> Only delete the template.</p>
    <p><b>YES:</b> Delete the template and also delete the template monitors and tasks from the destination Bots.</p>
  `

  return html
}
