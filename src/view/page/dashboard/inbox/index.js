import View from 'ampersand-view'
import InboxRowFactory from './item/factory'

import './style.less'

const EmptyView = View.extend({
  template: `<div class="no-notifications" data-hook="no-notifications">No notifications</div>`
})

export default View.extend({
  template: `
    <div class="inbox-container">
      <div data-hook="inbox-items-container"></div>
    </div>`,
  render () {
    this.renderWithTemplate(this)

    this.list = this.renderCollection(
      this.collection,
      InboxRowFactory,
      this.queryByHook('inbox-items-container'),
      {
        emptyView: EmptyView
      }
    )
  }
})
