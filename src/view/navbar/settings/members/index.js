import View from 'ampersand-view'
import App from 'ampersand-app'
import InviteMemberFormView from './invite-form'
import Modalizer from 'components/modalizer'
import MemberActions from 'actions/member'
import UserRow from './user-row'

//import '../settings.css'

module.exports = View.extend({
  template: require('./template.hbs'),
  events: {
    'click [data-hook=invite-user]': 'inviteMember'
  },
  inviteMember: function (event) {
    event.stopPropagation()

    const form = new InviteMemberFormView()

    const modal = new Modalizer({
      confirmButton: 'Send',
      buttons: true,
      title: 'Invite user',
      bodyView: form,
      class: 'settings-modal'
    })

    this.listenTo(modal,'shown',function(){ form.focus() })
    this.listenTo(modal,'hidden',function(){
      form.remove()
      modal.remove()
    })
    this.listenTo(modal,'confirm',function(){
      form.beforeSubmit()
      if (!form.valid) return
      MemberActions.inviteMember(form.data)
      modal.hide()
    })
    modal.show()
  },
  render() {
    this.renderWithTemplate(this)
    this.renderCollection(
      App.state.members,
      UserRow,
      this.queryByHook('list-container'),
      {}
    )
  }
})
