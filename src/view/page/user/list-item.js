import View from 'ampersand-view'
import ListItem from 'components/list/item'

import * as UserButtons from './buttons'

export default ListItem.extend({
  derived: {
    //tags: {
    //  deps: ['model.username', 'model.email', 'model.credential', 'model.customers'],
    //  fn: function () {
    //    return [
    //      'user',
    //      this.model.username,
    //      this.model.email,
    //      this.model.credential,
    //      this.model.customers,
    //      'credential=' + this.model.credential
    //    ].join(',')
    //  }
    //},
    item_name: {
      deps: ['model.username'],
      fn () {
        return this.model.username
      }
    },
    item_description: {
      deps: ['model.email','model.name'],
      fn () {
        const { name, email } = this.model
        return `${name} <${email}>`
      }
    },
  },
  render () {
    ListItem.prototype.render.apply(this,arguments)

    this.addButtons([
      { view: UserButtons.InfoButton, params: { model: this.model } },
      { view: UserButtons.ResendInvitationButton, params: { model: this.model } },
      { view: UserButtons.EditButton, params: { model: this.model } },
      { view: UserButtons.DeleteButton, params: { model: this.model } },
    ])

    this.renderSubview(
      new Collapsed({ model: this.model }),
      this.queryByHook('collapsed-content')
    )
  }
})

const Collapsed = View.extend({
  template: `
    <div class="row">
      <div class="col-sm-12">
        <h4>Email</h4>
        <span data-hook="email"></span>
      </div>
      <div class="col-sm-12">
        <h4>Username</h4>
        <span data-hook="username"></span>
      </div>
      <div class="col-sm-12">
        <h4>Creation Date</h4>
        <span data-hook="creation_date"></span>
      </div>
      <div class="col-sm-12">
        <h4>Activated</h4>
        <span data-hook="enabled"></span>
      </div>
      <div class="col-sm-12">
        <h4>Invitation Token</h4>
        <span data-hook="invitation_token"></span>
      </div>
    </div>
  `,
  derived: {
    invitation_token: {
      deps: ['model.invitation_token'],
      fn () {
        return this.model.invitation_token || 'Not Set'
      }
    }
  },
  bindings: {
    'model.email': {
      hook: 'email'
    },
    'model.username': {
      hook: 'username'
    },
    'model.creation_date': {
      hook: 'creation_date'
    },
    'model.enabled': {
      hook: 'enabled'
    },
    invitation_token: {
      hook: 'invitation_token',
    }
  }
})
