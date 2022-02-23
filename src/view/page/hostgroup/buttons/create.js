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

    this.listenTo(modal, 'shown', function(){
      form.focus()
    })

    this.listenTo(modal, 'hidden', function(){
      form.remove()
      modal.remove()
    })

    this.listenTo(modal, 'confirm', function(){
      form.beforeSubmit()
      if (form.valid === true) {
        HostGroupActions.create(form.data)
        modal.hide()
      }
    })

    modal.show()
  }
})
