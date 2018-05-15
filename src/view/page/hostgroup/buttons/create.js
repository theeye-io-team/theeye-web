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
  events: {
    click (event) {
      event.preventDefault()
      event.stopPropagation()

      const form = new FormView({
        model: new HostGroup()
      })

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
          const msg = [
            'This template will be applied to the source host.',
            'This means that any tasks or monitors deleted from the config will be deleted as well from the source host.'
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
              if (!confirm) {
                modal.hide()
                return
              }
              HostGroupActions.create(form.data)
              modal.hide()
            }
          })
        }
      })

      modal.show()
    }
  }
})
