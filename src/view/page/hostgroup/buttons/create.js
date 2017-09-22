import CommonButton from 'components/common-button'
import Modalizer from 'components/modalizer'
import FormView from '../form'
import { Model as HostGroup } from 'models/hostgroup'
import HostGroupActions from 'actions/hostgroup'

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
          HostGroupActions.create(form.data)
          modal.hide()
        }
      })

      modal.show()
    }
  }
})
