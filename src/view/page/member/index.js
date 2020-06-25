import App from 'ampersand-app'
import HelpTexts from 'language/help'
import List from 'components/list'
import HelpIconView from 'components/help-icon'
import { Model as MemberModel } from 'models/member'

import Modalizer from 'components/modalizer'
import CommonButton from 'components/common-button'
import CreateForm from './create-form'
import CustomerRow from './list-item'

const CreateButton = CommonButton.extend({
  initialize () {
    this.title = 'New Member'
    this.className = 'btn btn-primary tooltiped'
    this.iconClass = 'fa fa-plus'
  },
  events: {
    click: 'onClickCreate'
  },
  onClickCreate (event) {
    event.preventDefault()
    event.stopPropagation()

    const form = new CreateForm({ model: new MemberModel() })
    const modal = new Modalizer({
      confirmButton: 'Save',
      buttons: true,
      title: 'Create Member',
      bodyView: form
    })

    this.listenTo(modal,'hidden',function(){
      form.remove()
      modal.remove()
    })
    this.listenTo(modal,'confirm',function(){
      form.beforeSubmit()
      if (!form.valid) {
        return
      }
      App.actions.member.admin.create(form.data)
      modal.hide()
    })
    modal.show()
  }
})


export default List.extend({
  autoRender: true,
  initialize (options) {
    options = options || {}
    this.title = 'Members'
  },
  render () {
    List.prototype.render.apply(this,arguments)

    this.header.addMainButton(new CreateButton())
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
