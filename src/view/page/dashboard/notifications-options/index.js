import View from 'ampersand-view'
import NotificationActions from 'actions/notifications'
import Modalizer from 'components/modalizer'
import './styles.less'

export default View.extend({
  template: `
    <div data-component="notifications-options">
      <span data-hook="empty-inbox-notifications" class="delete-all fa fa-trash-o"></span>
    </div>
  `,
  initialize () {
    View.prototype.initialize.apply(this, arguments)
  },
  events: {
    'click [data-hook=empty-inbox-notifications]': 'onClickEmptyInbox'
  },
  onClickEmptyInbox (event) {
    const body = new DeleteNotificationsView()
    const modal = new Modalizer({
      confirmButton: 'Delete',
      buttons: true,
      title: 'Notifications',
      bodyView: body
    })

    modal.on('confirm', event => {
      // let removeAll = body.query('input').checked
      NotificationActions.removeAllRead(true)
      modal.hide()
    })

    this.listenTo(modal, 'hidden', () => {
      modal.remove()
      body.remove()
    })

    modal.show()
  }
})

const DeleteNotificationsView = View.extend({
  template: `
    <div>
      <span>Delete read notifications?</span>
      <div style="bottom:0; position:absolute;">
      </div>
    </div>
  `
})
