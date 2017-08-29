/**
 * @author Facugon
 * @namespace view
 * @module page/webhook
 */
import App from 'ampersand-app'
import Clipboard from 'clipboard'
import HelpTexts from 'language/help'
import WebhookActions from 'actions/webhook'
import List from 'components/list'
import HelpIconView from 'components/help-icon'
import Loader from 'components/loader'
import Modalizer from 'components/modalizer'
import CommonButton from 'components/common-button'
import MassiveDeleteButton from 'components/list/header/buttons/massive-delete'
import WebhookForm from './form'
import WebhookRow from './list-item'

const CreateButton = CommonButton.extend({
  initialize (options) {
    this.title = 'New Incomming Webhook'
    this.className = 'btn btn-primary tooltiped'
    this.iconClass = 'fa fa-plus'
  },
  events: {
    click: 'onClickCreate'
  },
  onClickCreate (event) {
    event.preventDefault()
    event.stopPropagation()

    const form = new WebhookForm()
    const modal = new Modalizer({
      confirmButton: 'Save',
      buttons: true,
      title: 'Create new Incoming Webhook',
      bodyView: form
    })

    this.listenTo(modal,'shown',function(){
      form.focus()
    })
    this.listenTo(modal,'hidden',function(){
      form.remove()
      modal.remove()
    })
    this.listenTo(modal,'confirm',function(){
      WebhookActions.create(form.data)
      modal.hide()
    })
    modal.show()
  }
})

const MassDelete = MassiveDeleteButton.extend({
  initialize () {
    MassiveDeleteButton.prototype.initialize.apply(this,arguments)
    this.name = 'webhook'
    this.displayProperty = 'name'
  },
  deleteItems (webhooks) {
    WebhookActions.massiveDelete(webhooks)
  }
})

module.exports = List.extend({
  autoRender: true,
  initialize (options) {
    options = options || {}
    this.title = 'Webhooks'
  },
  render () {
    List.prototype.render.apply(this,arguments)

    new Clipboard('.clip')

    this.header.addMainButton(new CreateButton())
    this.header.addMassiveButton(new MassDelete())
    this.renderList(WebhookRow,{})

    this.renderSubview(
      new HelpIconView({
        color: [255,255,255],
        category: 'title_help',
        text: HelpTexts.titles.webhook_page 
      }),
      this.queryByHook('title-help')
    )
  }
})
