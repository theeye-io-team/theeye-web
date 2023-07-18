import App from 'ampersand-app'
import $ from 'jquery'
import XHR from 'lib/xhr'
const xhr = $.ajax

export default {
  create (data) {
    App.state.loader.visible = true

    let body = {}
    body.enabled = data.enabled
    body.email = data.email
    body.username = data.username
    body.name = data.name
    if (data.enabled) { // create enable, need password
      body.password = data.password
      body.confirmPassword = data.confirmPassword
    }

    const urlRoot = `${App.config.api_url}/admin/user`

    XHR.send({
      url: `${urlRoot}`,
      method: 'POST',
      jsonData: body,
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done: (response,xhr) => {
        App.state.loader.visible = false
        let user = new App.Models.User.Model(response)
        App.state.admin.users.add(user)
        App.state.alerts.info('success')
        alert('The user you created does not belong to any organization. Assign it now to an organization using the members panel. Until then the user won\'t be able to login')
      },
      fail: (err,xhr) => {
        App.state.loader.visible = false
        App.state.alerts.danger('sorry', 'failed to do that')
      }
    })
  },
  update (id, data) {
    App.state.loader.visible = true

    let user = App.state.admin.users.get(id)
    user.set(data)
    user.save({}, {
      collection: App.state.admin.user,
      success: function () {
        App.state.loader.visible = false
        App.state.alerts.info('success')
        App.state.admin.users.add(user, {merge: true})
      },
      error: (err) => {
        App.state.loader.visible = false
        App.state.alerts.danger('sorry', 'failed to do that')
      }
    })
  },
  remove (id) {
    App.state.loader.visible = true

    let user = new App.Models.User.Model({ id: id })

    user.destroy({
      success: function () {
        App.state.loader.visible = false
        App.state.alerts.info('success')
        App.state.admin.users.remove(user)
      },
      error: (err) => {
        App.state.loader.visible = false
        App.state.alerts.danger('sorry', 'failed to do that')
      }
    })
  },
  resendInvitation (id) {
    App.state.loader.visible = true
    const urlRoot = `${App.config.api_url}/admin/user`
    XHR.send({
      url: `${urlRoot}/${id}/reinvite`,
      method: 'PUT',
      jsonData: {},
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done: (response, xhr) => {
        App.state.loader.visible = false
        App.state.alerts.info('success')
      },
      fail: (err, xhr) => {
        App.state.loader.visible = false
        App.state.alerts.danger('sorry', 'failed to do that')
      }
    })
  }
}
