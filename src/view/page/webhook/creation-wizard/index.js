import App from 'ampersand-app'
import View from 'ampersand-view'
import WebhookForm from 'view/page/webhook/form'
import WebhookActions from 'actions/webhook'
import Modalizer from 'components/modalizer'

export default View.extend({
  initialize() {
    const form = new WebhookForm()
    const modal = new Modalizer({
      confirmButton: 'Save',
      buttons: true,
      title: 'Create new Incoming Webhook',
      bodyView: form
    })
    this.listenTo(modal, 'shown', function () {
      form.focus()
    })
    this.listenTo(modal, 'hidden', function () {
      form.remove()
      modal.remove()
    })
    this.listenTo(modal, 'confirm', function () {
      WebhookActions.create(form.data)
      modal.hide()
    })
    modal.show()
    return modal
  }
})