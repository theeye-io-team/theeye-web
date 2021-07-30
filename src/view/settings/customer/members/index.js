import View from 'ampersand-view'
import App from 'ampersand-app'
import InviteMemberFormView from './invite-form'
import Modalizer from 'components/modalizer'
import UserRow from './user-row'

import "./style.less"

export default View.extend({
  template: () => {
    let html = `
      <div>
        <h3 class="blue bold">MEMBERS</h3>
        <div class="row">
          <div class="col-xs-6">
            <div class="members-search">
              <i class="fa fa-search" aria-hidden="true"></i>
              <input autocomplete="off" data-hook="members-input" class="members-input" placeholder="Search">
            </div>
          </div>
          <div class="col-xs-6">
            <h4 class="pull-right cursor-pointer">
              <a class="blue" data-hook="invite-user">
                <i class="fa fa-plus"></i> Invite user
              </a>
            </h4>
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
  props: {
    memberSearch: ['string', false, '']
  },
  bindings: {
    memberSearch: {
      type: 'value',
      hook: 'members-input'
    }
  },
  events: {
    'click [data-hook=invite-user]': 'inviteMember',
    'input [data-hook=members-input]': 'onSearchInput',
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
  onSearchInput (event) {
    this._subviews[0].views.forEach(
      view => {
        view.visible = (
          view.model.label.toLowerCase().includes(event.target.value.toLowerCase())
        )
      }
    )
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
