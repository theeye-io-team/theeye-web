//import $ from 'jquery'
import PanelButton from 'components/list/item/panel-button'
import Modalizer from 'components/modalizer'
import UserActions from 'actions/user'
import EditFormView from './edit-form'

module.exports = PanelButton.extend({
  initialize (options) {
    this.tip = 'Edit User'
    this.iconClass = 'fa fa-edit'
    this.className = 'btn btn-primary editButton'
  },
  events: {
    click: function (event) {
      event.stopPropagation()

      const form = new EditFormView({ model: this.model })

      const modal = new Modalizer({
        confirmButton: 'Save',
        buttons: true,
        title: this.tip,
        bodyView: form
      })

      this.listenTo(modal,'shown',function(){ form.focus() })
      this.listenTo(modal,'hidden',function(){
        form.remove()
        modal.remove()
      })
      this.listenTo(modal,'confirm',function(){
        form.beforeSubmit()
        if (!form.valid) return
        UserActions.update(this.model.id, form.data)
        modal.hide()
      })
      modal.show()
    }
  }
})
