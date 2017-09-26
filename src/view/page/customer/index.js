/**
 * @author Facugon
 * @namespace view
 * @module page/webhook
 */
import App from 'ampersand-app'
import HelpTexts from 'language/help'
import CustomerActions from 'actions/customer'
import List from 'components/list'
import HelpIconView from 'components/help-icon'
import { Model as CustomerModel } from 'models/customer'

import Modalizer from 'components/modalizer'
import CommonButton from 'components/common-button'
import MassiveDeleteButton from 'components/list/header/buttons/massive-delete'
import CustomerForm from './form'
import CustomerRow from './list-item'

const CreateButton = CommonButton.extend({
  initialize (options) {
    this.title = 'New Customer'
    this.className = 'btn btn-primary tooltiped'
    this.iconClass = 'fa fa-plus'
  },
  events: {
    click: 'onClickCreate'
  },
  onClickCreate (event) {
    event.preventDefault()
    event.stopPropagation()

    const form = new CustomerForm({ model: new CustomerModel() })
    const modal = new Modalizer({
      confirmButton: 'Save',
      buttons: true,
      title: 'Create Customer',
      bodyView: form
    })

    this.listenTo(modal,'hidden',function(){
      form.remove()
      modal.remove()
    })
    this.listenTo(modal,'confirm',function(){
      form.beforeSubmit()
      if (!form.valid) return
      CustomerActions.create(form.data, modal)
    })
    modal.show()
  }
})

const MassDelete = MassiveDeleteButton.extend({
  initialize () {
    MassiveDeleteButton.prototype.initialize.apply(this,arguments)
    this.name = 'customer'
    this.displayProperty = 'name'
  },
  deleteItems (customers) {
    CustomerActions.massiveDelete(customers)
  }
})

module.exports = List.extend({
  autoRender: true,
  initialize (options) {
    options = options || {}
    this.title = 'Customers'
  },
  render () {
    List.prototype.render.apply(this,arguments)

    this.header.addMainButton(new CreateButton())
    this.header.addMassiveButton(new MassDelete())
    this.renderList(CustomerRow,{})

    this.renderSubview(
      new HelpIconView({
        color: [255,255,255],
        category: 'title_help',
        text: HelpTexts.titles.customer_page
      }),
      this.queryByHook('title-help')
    )
  }
})
