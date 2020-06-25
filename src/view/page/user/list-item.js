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
      <div class="col-sm-12">
        <h4>Email</h4>
        <span data-hook="email"></span>
      </div>
  `,
  bindings: {
    'model.email': {
      hook:'email'
    }
  }
})
