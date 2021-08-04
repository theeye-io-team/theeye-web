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
import CommonButton from 'components/common-button'
import MassiveDeleteButton from 'components/list/header/buttons/massive-delete'
import WebhookRow from './list-item'
import WebhookCreationWizard from 'view/page/webhook/creation-wizard'

const CreateButton = CommonButton.extend({
  initialize (options) {
    this.title = 'New Incoming Webhook'
    this.className = 'btn btn-primary tooltiped'
    this.iconClass = 'fa fa-plus'
  },
  events: {
    click: 'onClickCreate'
  },
  onClickCreate (event) {
    event.preventDefault()
    event.stopPropagation()

    let wizard = new WebhookCreationWizard()
  }
})

const MassDelete = MassiveDeleteButton.extend({
  initialize () {
    MassiveDeleteButton.prototype.initialize.apply(this,arguments)
    this.name = 'webhooks'
    this.displayProperty = 'name'
  },
  deleteItems (webhooks) {
    WebhookActions.massiveDelete(webhooks)
  }
})

export default List.extend({
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
