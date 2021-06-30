//import jquery from 'jquery'
import bootbox from 'bootbox'
import App from 'ampersand-app'
import Acls from 'lib/acls'
import config from 'config'
import XHR from 'lib/xhr'

export default {
  removeMember: function(member) {
    App.state.loader.visible = true

    member.destroy({
      success: function() {
        App.state.loader.visible = false
        bootbox.alert({
          title: 'Success',
          message: 'Member permissions revoked.'
        })
        App.state.members.remove( member )
      },
      error (member, response) {
        App.state.loader.visible = false
        bootbox.alert({
          title: 'Error',
          message: 'Error updating member access.'
        })
      }
    });
  },
  updateCredential: function(member, data) {
    App.state.loader.visible = true

    member.set(data)
    member.save(data,{
      patch: true,
      collection: App.state.members,
      success: function(result, response){
        App.state.loader.visible = false
        bootbox.alert({
          title: 'Success',
          message: 'Member credentials updated.'
        })
        App.state.members.add(response, {merge: true})
      },
      error (member, response) {
        App.state.loader.visible = false
        bootbox.alert({
          title: 'Error',
          message: 'Error updating member credentials.'
        })
      }
    })
  },
  inviteMember (data) {
    App.state.loader.visible = true

    var member = new App.Models.Member.Model({})
    data.user = {}
    data.user.username = data.email
    data.user.email = data.email
    data.user.name = data.name
    data.user.credential = data.credential
    delete data.email

    member.set(data)
    member.save({},{
      success: (result, newMember) => {
        App.state.loader.visible = false
        var message = 'Invitation sent.'
        member.set({user_id: newMember.id})
        App.state.members.add(member)
        bootbox.alert({ title: 'Success', message })
      },
      error (member, response) {
        App.state.loader.visible = false
        var message = 'Error sending user invitation.'
        if (response[0].body.code === 'AlreadyActiveMember') {
          message = 'The user is already a member of the organization.'
        }
        bootbox.alert({ title: 'Error', message })
      }
    });
  },
  fetch () {
    if (
      Acls.hasAccessLevel('manager') &&
      App.state.session.user.credential !== 'admin'
    ) {
      App.state.members.fetch({
        error (err,xhr) {
          bootbox.alert('Something goes wrong fetching members. Please refresh')
        }
      })
    }
  },
  admin: {
    create (data) {
      App.state.loader.visible = true

      data.user = {}
      data.user.username = data.email
      data.user.email = data.email
      data.user.name = data.name
      data.user.credential = data.credential
      delete data.email

      XHR.send({
        url: `${config.api_url}/admin/member`,
        method: 'post',
        jsonData: data,
        headers: {
          Accept: 'application/json;charset=UTF-8'
        },
        done (member, xhr) {
          App.state.loader.visible = false
          var message = 'Invitation sent.'
          App.state.admin.members.add(member)
          bootbox.alert({ title: 'Success', message })
        },
        fail (err, xhr) {
          App.state.loader.visible = false
          var message = 'Error sending user invitation.'
          if (err.code === 'AlreadyActiveMember') {
            message = 'The user is already a member of the organization.'
          }
          bootbox.alert({ title: 'Error', message })
        }
      })
    },
    remove: (id) => {
      App.state.loader.visible = true

      XHR.send({
        url: `${config.api_url}/admin/member/${id}`,
        method: 'delete',
        headers: {
          Accept: 'application/json;charset=UTF-8'
        },
        done (response,xhr) {
          App.state.loader.visible = false
          App.state.admin.members.remove(id)
          bootbox.alert({
            title: 'Success',
            message: 'Member removed.'
          })
        },
        fail (err,xhr) {
          App.state.loader.visible = false
          bootbox.alert({
            title: 'Error',
            message: 'Error updating member access.'
          })
        }
      })
    },
    updateCredential: (id, data) => {
      App.state.loader.visible = true
      console.log(data)
      XHR.send({
        url: `${config.api_url}/admin/member/${id}`,
        method: 'PATCH',
        jsonData: data,
        headers: { Accept: 'application/json;charset=UTF-8' },
        done (response,xhr) {
          App.state.loader.visible = false
          bootbox.alert({
            title: 'Success',
            message: 'Member updated.'
          })
          App.state.admin.members.add(response, {merge: true})
        },
        fail (err,xhr) {
          console.log(err)
          console.log(xhr.response)
          App.state.loader.visible = false
          bootbox.alert({
            title: 'Error',
            message: 'Error updating member.'
          })
        }
      })
    }
  }
}
