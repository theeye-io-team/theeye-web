//import jquery from 'jquery'
import bootbox from 'bootbox'
import App from 'ampersand-app'
const xhr = $.ajax
import XHR from 'lib/xhr'
import config from 'config'
import { Model as Member } from 'models/member'

module.exports = {
  removeMember: function(data) {
    App.state.loader.visible = true
    var member = new Member({ id: data.userId })
    member.destroy({
      success: function() {
        App.state.loader.visible = false
        bootbox.alert({
          title: 'Success',
          message: 'Member permissions revoked.'
        })
        App.state.members.remove( member )
      },
      error: function(err) {
        App.state.loader.visible = false
        bootbox.alert({
          title: 'Error',
          message: 'Error updating member access.'
        })
      }
    });
  },
  updateMemberCredential: function(userId, data) {
    App.state.loader.visible = true
    var member = new Member({ id: userId })
    data.user = {credential: data.credential}
    member.set(data)
    member.save({},{
      collection: App.state.members,
      success: function(result, response){
        App.state.loader.visible = false
        bootbox.alert({
          title: 'Success',
          message: 'Member credentials updated.'
        })
        App.state.members.add(response, {merge: true})
      },
      error: function(err) {
        App.state.loader.visible = false
        bootbox.alert({
          title: 'Error',
          message: 'Error updating member credentials.'
        })
      }
    })
  },
  inviteMember: function(data) {
    App.state.loader.visible = true
    var member = new Member()
    data.user = {}
    data.user.username = data.email
    data.user.email = data.email
    data.user.name = data.name
    data.user.credential = data.credential
    delete data.email

    member.set(data)
    member.save({},{
      success: function(result, response) {
        App.state.loader.visible = false
        var message = 'Invitation sent.'
        if(response.resend)
          message = 'The user is already a member of this organization. <br> A new invitation email has been sent.'
        member.set({user_id: member.id})
        App.state.members.add(response.member)
        bootbox.alert({
          title: 'Success',
          message: message
        })
      },
      error: function(err, response) {
        App.state.loader.visible = false
        var message = 'Error sending user invitation.'
        if(response.body === 'activeMember')
          message = 'The user is already a member of this organization.'
        bootbox.alert({
          title: 'Error',
          message: message
        })
      }
    });
  }
}
