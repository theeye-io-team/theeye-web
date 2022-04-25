//import $ from 'jquery'
import App from 'ampersand-app'
import PanelButton from 'components/list/item/panel-button'
import Modalizer from 'components/modalizer'
import PasswordFormView from './password-form'
import XHR from 'lib/xhr'
import $ from 'jquery'

export default PanelButton.extend({
  initialize (options) {
    this.title = 'Change Password'
    this.iconClass = 'fa fa-key dropdown-icon'
    this.className = 'btn btn-primary editButton'
  },
  events: {
    click: function (event) {
      event.stopPropagation()
      $('.dropdown.open .dropdown-toggle').dropdown('toggle')

      const form = new PasswordFormView({ model: this.model })

      const modal = new Modalizer({
        confirmButton: 'Save',
        buttons: true,
        title: `Change password user : ${this.model.username} <${this.model.email}>`,
        bodyView: form
      })

      this.listenTo(modal,'shown', function () { form.focus() })
      this.listenTo(modal,'hidden', function () {
        form.remove()
        modal.remove()
      })
      this.listenTo(modal,'confirm', function () {
        form.beforeSubmit()
        if (!form.valid) { return }

        updatePassword(this.model.id, form.data.password)
          .then(() => modal.hide())
      })
      modal.show()
    }
  }
})

const updatePassword = (user_id, password) => {
  return new Promise( (resolve, reject) => {
    App.state.loader.visible = true
    XHR.send({
      url: `${App.config.api_url}/admin/auth/password/change`,
      method: 'put',
      jsonData: { user_id, password },
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done: (response,xhr) => {
        App.state.loader.visible = false
        if (xhr.status === 200) {
          App.state.alerts.success('Success', 'Password Updated')
          resolve()
        } else {
          App.state.alerts.danger('Something goes wrong.')
          reject()
        }
      },
      fail: (err,xhr) => {
        App.state.loader.visible = false
        App.state.alerts.danger('Something goes wrong.')
        reject()
      }
    })
  })
}
