import View from 'ampersand-view'
import App from 'ampersand-app'
import InviteMemberFormView from './invite-form'
import Modalizer from 'components/modalizer'
import UserRow from './user-row'

export default View.extend({
  template: () => {
    let html = `
      <div>
        <h3 class="blue bold">MEMBERS</h3>
        <div class="row">
          <div class="col-xs-12">
            <h4 class="pull-right cursor-pointer"><a class="blue" data-hook="invite-user"><i class="fa fa-plus"></i> Invite user</a></h4>
          </div>
        </div>
        <div class="row">
          <div class="col-xs-12">
            <div data-hook="list-container"></div>
          </div>
        </div>
      </div>
      `
    return html
  },
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
      if (!form.valid) {
        return
      }
      App.actions.member.inviteMember(form.data)
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
