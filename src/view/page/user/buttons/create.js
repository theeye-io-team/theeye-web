import bootbox from 'components/bootbox'
import $ from 'jquery'
import { Model as UserModel } from 'models/user'
import CreateFormView from './create-form'
import CommonButton from 'components/common-button'
import UserActions from 'actions/user'
import Modalizer from 'components/modalizer'

export default CommonButton.extend({
  initialize (options) {
    this.title = 'New User'
    this.className = 'btn btn-primary createUser'
    this.iconClass = 'fa fa-plus'
  },
  events: {
    click: function (event) {
      event.stopPropagation()

      const form = new CreateFormView({
        model: new UserModel()
      })

      const modal = new Modalizer({
        confirmButton: 'Save',
        buttons: true,
        title: this.title,
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
        UserActions.create(form.data)
        modal.hide()
      })
      modal.show()
    }
  }
})
