import bootbox from 'bootbox'
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
        bootbox.alert('User created')
      },
      fail: (err,xhr) => {
        App.state.loader.visible = false
        bootbox.alert('Error creating user')
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
        bootbox.alert('User Updated')
        App.state.admin.users.add(user, {merge: true})
      },
      error: function (err) {
        App.state.loader.visible = false
        bootbox.alert('Error updating user')
      }
    })
  },
  remove (id) {
    App.state.loader.visible = true

    let user = new App.Models.User.Model({ id: id })

    user.destroy({
      success: function () {
        App.state.loader.visible = false
        bootbox.alert('User Deleted')
        App.state.admin.users.remove(user)
      },
      error: function (err) {
        App.state.loader.visible = false
        bootbox.alert('Error removing user')
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
      done: (response,xhr) => {
        App.state.loader.visible = false
        bootbox.alert('Invitation sent.')
      },
      fail: (err,xhr) => {
        App.state.loader.visible = false
        bootbox.alert('Error sending invitation')
      }
    })
  }
}
