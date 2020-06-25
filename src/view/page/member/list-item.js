import App from 'ampersand-app'
import BaseView from 'view/base-view'
import ListItem from 'components/list/item'
import bootbox from 'bootbox'
import Modalizer from 'components/modalizer'
import View from 'ampersand-view'
import EditForm from './edit-form'
import $ from 'jquery'
import { Model as MemberModel } from 'models/member'
import FilteredCollection from 'ampersand-filtered-subcollection'

const MemberButtons = BaseView.extend({
  template: `
    <div>
      <li>
        <button class="btn btn-primary" data-hook="edit" title="Edit">
          <span class="fa fa-edit dropdown-icon"></span>
          <span>Edit member</span>
        </button>
      </li>
      <li>
        <button class="btn btn-primary" data-hook="remove" title="Delete">
          <span class="fa fa-trash dropdown-icon"></span>
          <span>Delete member</span>
        </button>
      </li>
    </div>
  `,
  events: {
    'click [data-hook=edit]':'onClickEdit',
    'click [data-hook=remove]':'onClickRemove'
  },
  onClickEdit(event){
    event.preventDefault()
    event.stopPropagation()
    $('.dropdown.open .dropdown-toggle').dropdown('toggle')

    this.editMember()
  },
  onClickRemove(event){
    event.preventDefault()
    event.stopPropagation()
    $('.dropdown.open .dropdown-toggle').dropdown('toggle')

    bootbox.confirm(`Remove member for the user ${this.model.user.username}?`,
      (confirmed) => {
        if (!confirmed) { return }
        App.actions.member.admin.remove(this.model.id)
      }
    )
  },
  editMember () {
    event.stopPropagation()

    const form = new EditForm({ model: this.model })

    const modal = new Modalizer({
      confirmButton: 'Save',
      buttons: true,
      title: `Select credential for ${this.model.username}`,
      bodyView: form,
      class: 'settings-modal'
    })

    this.listenTo(modal,'shown',function(){ form.focus() })
    this.listenTo(modal,'hidden',function(){
      form.remove()
      modal.remove()
    })
    this.listenTo(modal,'confirm',function(){
      form.beforeSubmit()
      if (!form.valid) return
      App.actions.member.admin.updateCredential(this.model.id, form.data)
      modal.hide()
    })
    modal.show()
  }
})

const Collapsed = View.extend({
  template: `
      <div class="col-sm-12">
        <h1><span data-hook="name"></span> members:</h1>
        <div class="members-container" data-hook="members"></div>
      </div>
  `,
  bindings: {
    'model.name': {
      hook:'name'
    },
    'model.description': {
      hook:'description'
    }
  },
  collections: {
    members: MemberModel
  },
  initialize () {
    let self = this
    let filters = [ model => model.customer_id === self.model.id ]
    this.members = new FilteredCollection(App.state.admin.members, { filters })
  },
  render () {
    View.prototype.render.apply(this,arguments)

    this.renderCollection(
      this.members,
      MemberListItem,
      this.queryByHook('members')
    )
  }
})

const MemberListItem = View.extend({
  template () {
    const html = `
      <div class="itemRow panel panel-default js-searchable-item"
        data-item-id="${this.model.id}"
        data-item-name="model.username"
        data-tags="view.tags">
        <div class="panel-heading" role="tab" id="heading_${this.model.id}">
          <h4 class="panel-title">
            <div class="panel-title-content">
              <span class="panel-item name">
                <span data-hook="item_name">${this.model.username}</span> is <b><span>${this.model.credential}</span></b>
              </span>
              <div data-hook="dropdown-icons" class="panel-item icons dropdown">
                <button class="btn dropdown-toggle btn-primary"
                  type="button"
                  data-hook="buttons-container"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="true">
                  <i class="fa fa-ellipsis-v" aria-hidden="true"></i>
                </button>
                <ul class="dropdown-menu" data-hook="action-buttons">
                </ul>
              </div>
            </div>
          </h4>
        </div>
      </div>
    `
    return html
  },
  initialize() {
    ListItem.prototype.initialize.apply(this,arguments)
    this.model.on('change', () => this.render(), this)
    this.model.on('destroy', () => this.remove(), this)
  },
  render () {
    ListItem.prototype.render.apply(this,arguments)

    this.renderSubview(
      new MemberButtons({ model: this.model }),
      this.query('div.panel-item.icons ul.dropdown-menu[data-hook=action-buttons]')
    )
  }
})

export default ListItem.extend({
  derived: {
    item_name: {
      deps: ['model.name'],
      fn () {
        return this.model.name
      }
    },
    item_description: {
      deps: ['model.id'],
      fn () {
        return 'unique id ' + this.model.id
      }
    }
  },
  initialize() {
    this.showButtons = false
    this.selectable = false
    ListItem.prototype.initialize.apply(this,arguments)
    this.model.on('change', () => this.render(), this)
    this.model.on('destroy', () => this.remove(), this)
  },
  render () {
    ListItem.prototype.render.apply(this,arguments)

    this.renderSubview(
      new Collapsed({ model: this.model }),
      this.queryByHook('collapsed-content')
    )
  }
})
