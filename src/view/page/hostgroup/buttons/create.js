import CommonButton from 'components/common-button'
import Modalizer from 'components/modalizer'
import FormView from '../form'
import { Model as HostGroup } from 'models/hostgroup'
import HostGroupActions from 'actions/hostgroup'
import bootbox from 'bootbox'

module.exports = CommonButton.extend({
  initialize (options) {
    this.title = 'New Host Group'
    this.className = 'btn btn-primary tooltiped'
    this.iconClass = 'fa fa-plus'
  },
  onClickButton () {
    HostGroupActions.resetTemplatesConfig()

    let model = new HostGroup()
    const form = new FormView({ model })

    const modal = new Modalizer({
      confirmButton: 'Create',
      buttons: true,
      title: 'Create Host Template',
      bodyView: form
    })

    this.listenTo(modal,'shown',function(){
      form.focus()
    })

    this.listenTo(modal,'hidden',function(){
      form.remove()
      modal.remove()
    })

    this.listenTo(modal,'confirm',function(){
      form.beforeSubmit()
      if (form.valid === true) {
        if (form.data.copy_host) {
          const msg = [
            'Do you want to apply this configuration to the source host you used to create this template?',
            '<b>NO:</b> Do not apply template configuration to the source host.',
            '<b>YES:</b> Apply template configuration to the source host. <br> This means that any tasks or monitors deleted from the config will be deleted as well from the source host.'
          ].join('<br>')

          bootbox.confirm({
            title: 'Warning! Please, read carefully before you continue.',
            message: msg,
            buttons: {
              confirm: {
                label: 'YES',
                className: 'btn-danger'
              },
              cancel: {
                label: 'NO',
                className: 'btn-default'
              },
            },
            callback: confirm => {
              HostGroupActions.create(form.data, confirm)
              modal.hide()
            }
          })
        } else {
          HostGroupActions.create(form.data, false)
          modal.hide()
        }
      }
    })

    modal.show()
  },
  //events: {
  //  click (event) {
  //    event.preventDefault()
  //    event.stopPropagation()
  //    this.onClickButton()
  //  }
  //}
})
