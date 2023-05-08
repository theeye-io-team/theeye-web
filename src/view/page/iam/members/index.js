import View from 'ampersand-view'
import App from 'ampersand-app'
import UserForm from './form'
import Modalizer from 'components/modalizer'
import MemberRow from './user-row'

import "./style.less"

export default View.extend({
  initialize () {
    View.prototype.initialize.apply(this, arguments)
    App.state.members.fetch()
  },
  template: `
    <div>
      <h3 class="blue bold">Members</h3>
      <div class="row">
        <div class="col-xs-6">
          <div class="users-search">
            <i class="fa fa-search" aria-hidden="true"></i>
            <input autocomplete="off" data-hook="users-input" class="users-input" placeholder="Search">
          </div>
        </div>
        <div class="col-xs-6">
          <h4 class="pull-right cursor-pointer">
            <a class="blue" data-hook="invite-user">
              <i class="fa fa-plus"></i> Add Member
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
  `,
  props: {
    userSearch: ['string', false, '']
  },
  bindings: {
    userSearch: {
      type: 'value',
      hook: 'users-input'
    }
  },
  events: {
    'click [data-hook=invite-user]': 'addUser',
    'input [data-hook=users-input]': 'onSearchInput',
  },
  addUser: function (event) {
    event.stopPropagation()

    const form = new UserForm({
      model: new App.Models.Member.Model()
    })

    const modal = new Modalizer({
      confirmButton: 'Send',
      buttons: true,
      title: 'Invite',
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
      debugger
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
      MemberRow,
      this.queryByHook('list-container'),
      {}
    )
  }
})
