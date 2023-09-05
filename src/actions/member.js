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
        App.state.alerts.success('Member permissions revoked.')
        App.state.members.remove( member )
      },
      error (member, response) {
        App.state.loader.visible = false
        App.state.alerts.danger('Error updating member access.')
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
        App.state.alerts.success('Member credentials updated.')
        App.state.members.add(response, {merge: true})
      },
      error (member, response) {
        App.state.loader.visible = false
        App.state.alerts.danger('Error')
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
        member.set({user_id: newMember.id})
        App.state.members.add(member)
        App.state.alerts.success('Member addedd.')
      },
      error (member, response) {
        App.state.loader.visible = false
        var message = 'Error addind the new member.'
        if (response[0].body.code === 'AlreadyActiveMember') {
          message = 'The user is already a member of the organization.'
        }
        App.state.alerts.success('Member permissions revoked.')
        App.state.alerts.danger(message)
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
          App.state.alerts.success('Member permissions revoked.')
          App.state.alerts.danger('Something goes wrong fetching members. Please refresh')
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
          App.state.admin.members.add(member)
          App.state.alerts.success('Member added.')
        },
        fail (err, xhr) {
          App.state.loader.visible = false
          var message = 'Error addind the new member.'
          if (err.code === 'AlreadyActiveMember') {
            message = 'The user is already a member of the organization.'
          }
          App.state.alerts.danger(message)
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
          App.state.alerts.success('Access revoked')
        },
        fail (err,xhr) {
          App.state.loader.visible = false
          App.state.alerts.danger('Error updating member access.')
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
          App.state.alerts.success('Updated')
          App.state.admin.members.add(response, {merge: true})
        },
        fail (err,xhr) {
          console.log(err)
          console.log(xhr.response)
          App.state.loader.visible = false
          App.state.alerts.danger('Error updating member.')
        }
      })
    }
  }
}
