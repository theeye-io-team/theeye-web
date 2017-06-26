import View from 'ampersand-view'
import ListItem from 'components/list/item'

import * as UserButtons from './buttons'

export default ListItem.extend({
  derived: {
    tags: {
      deps: ['model.username', 'model.email', 'model.credential', 'model.customers'],
      fn: function () {
        return [
          'user',
          this.model.username,
          this.model.email,
          this.model.credential,
          this.model.customers,
          'credential=' + this.model.credential
        ].join(',')
      }
    },
    item_name: {
      deps: ['model.username'],
      fn () {
        return this.model.username
      }
    },
    item_description: {
      deps: ['model.credential'],
      fn () {
        return this.model.credential
      }
    }
  },
  render () {
    ListItem.prototype.render.apply(this,arguments)

    const buttons = [
      new UserButtons.InfoButton({ model: this.model }),
      new UserButtons.ResendInvitationButton({ model: this.model }),
      new UserButtons.EditButton({ model: this.model }),
      new UserButtons.DeleteButton({ model: this.model }),
    ]

    this.addButtons(buttons)

    this.renderSubview(
      new Collapsed({ model: this.model }),
      this.queryByHook('collapsed-content')
    )
  }
})

const Collapsed = View.extend({
  template: `
      <div class="col-sm-12">
        <h4>Email</h4>
        <span data-hook="email"></span>
        <h4>Credential</h4>
        <span data-hook="credential"></span>
        <h4>Organizations</h4>
        <span data-hook="customers"></span>
      </div>
  `,
  derived: {
    customers: {
      deps: ['model.customers'],
      fn () {
        return this.model.customers.map(c => c.name).join(', ')
      }
    }
  },
  bindings: {
    'model.email': {
      hook:'email'
    },
    'model.credential': {
      hook:'credential'
    },
    customers: {
      hook: 'customers'
    }
  }
})
