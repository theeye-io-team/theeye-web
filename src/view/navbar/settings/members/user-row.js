import View from 'ampersand-view'
import App from 'ampersand-app'
import MemberActions from 'actions/member'
import bootbox from 'bootbox'
import Modalizer from 'components/modalizer'
import FormView from 'ampersand-form-view'
import SelectView from 'components/select2-view'

import '../settings.css'

const EditUserFormView = FormView.extend({
  initialize: function (options) {
    this.fields = [
      new SelectView({
        options: App.state.credentials.filter( e => {
          return (e.name !== 'owner' && e.name !== 'root')
        }),
        value: this.model.credential,
        styles: 'form-group',
        name: 'credential',
        required: true,
        label: 'Credential',
        unselectedText: 'credential',
        idAttribute: 'name',
        textAttribute: 'name',
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label'
      }),
    ]
    FormView.prototype.initialize.apply(this, arguments)
  },
  render () {
    FormView.prototype.render.apply(this, arguments)
    this.query('form').classList.add('form-horizontal')
  },
  focus () {
    this.query('select[name=credential]').focus()
  }
})

module.exports = View.extend({
  autoRender: true,
  template: `<div class="row border social">
                 <div class="col-xs-6">
                    <div class="social-container">
                       <span class="circle" style="background:#073666"></span>
                       <span class="legend" data-hook="username"></span>
                       <span class="legend email" data-hook="email"></span>
                    </div>
                 </div>
                 <div class="col-xs-2">
                    <span data-hook="credential"></span>
                 </div>
                 <div class="col-xs-2">
                    <span data-hook="status"></span>
                 </div>
                 <div class="col-xs-2">
                    <div data-hook="member-icons" class="pull-right action-icons">
                      <span><i class="fa fa-edit blue" data-hook="edit-user"></i></span>
                      <span><i class="fa fa-user-times blue" data-hook="remove-user"></i></span>
                    </div>
                 </div>
              </div>`,
  bindings: {
    'model.user.username': {
      hook:'username'
    },
    'model.user.email': {
      hook:'email'
    },
    'status': {
      hook:'status'
    },
    'model.credential': {
      hook:'credential'
    }
  },
  derived: {
    status: {
      deps: ['model.user.enabled'],
      fn () {
        if(this.model.user.enabled)
          return 'Active'
        else {
          return 'Inactive'
        }
      }
    }
  },
  events: {
    'click [data-hook=remove-user]': 'removeUser',
    'click [data-hook=edit-user]': 'editUser'
  },
  removeUser: function (event) {
    event.stopPropagation()
    bootbox.confirm(`Revoke access to your organization for user ${this.model.user.username}?`,
      (confirmed) => {
        if (!confirmed) { return }
        MemberActions.removeMember({userId: this.model.user_id})
      }
    )
  },
  editUser: function (event) {
    event.stopPropagation()

    const form = new EditUserFormView({ model: this.model.user })

    const modal = new Modalizer({
      confirmButton: 'Save',
      buttons: true,
      title: `Select credential for ${this.model.username}`,
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
      MemberActions.updateMemberCredential(this.model.user_id, form.data)
      modal.hide()
    })
    modal.show()
  },
  render() {
    this.renderWithTemplate(this)
    if(this.model.user.id==App.state.session.user.id)
      this.queryByHook('member-icons').remove()
  }
})
