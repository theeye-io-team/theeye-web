import CommonButton from 'components/common-button'
import Modalizer from 'components/modalizer'
import FormView from '../form'
import { Model as HostGroup } from 'models/hostgroup'
import HostGroupActions from 'actions/hostgroup'
import bootbox from 'bootbox'

export default CommonButton.extend({
  initialize (options) {
    this.title = 'New Bot template'
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
      title: 'Create Bot Template',
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
            'Do you want to apply this configuration to the source Bot you used to create this template?',
            '<b>NO:</b> Do not apply template configuration to the source Bot.',
            '<b>YES:</b> Apply template configuration to the source Bot, too.'
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
