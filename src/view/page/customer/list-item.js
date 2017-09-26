import BaseView from 'view/base-view'
import ListItem from 'components/list/item'
import bootbox from 'bootbox'
import CustomerActions from 'actions/customer'
import Modalizer from 'components/modalizer'
import merge from 'lodash/merge'
import View from 'ampersand-view'
import CustomerForm from './form'

const CustomerButtons = BaseView.extend({
  template: `
    <div>
      <li>
        <button class="btn btn-primary simple-btn tooltiped" data-hook="edit" title="Edit">
          <span class="fa fa-edit"></span>
        </button>
      </li>
      <li>
        <button class="btn btn-primary simple-btn tooltiped" data-hook="remove" title="Delete">
          <span class="fa fa-trash"></span>
        </button>
      </li>
    </div>
  `,
  events: {
    'click [data-hook=edit]':'onClickEdit',
    'click [data-hook=remove]':'onClickRemove'
  },
  onClickEdit(event){
    event.preventDefault();
    event.stopPropagation();
    this.edit();
  },
  onClickRemove(event){
    event.preventDefault();
    event.stopPropagation();
    var model = this.model;
    bootbox.confirm('Continue removing ' + model.get('name') + ' customer ?', function(confirmed){
      if (confirmed) {
        CustomerActions.remove(model.id);
      }
    });
  },
  edit () {
    event.stopPropagation()

    const form = new CustomerForm({ model: this.model })

    const modal = new Modalizer({
      confirmButton: 'Save',
      buttons: true,
      title: 'Edit customer',
      bodyView: form
    })

    this.listenTo(modal,'hidden',function(){
      form.remove()
      modal.remove()
    })
    this.listenTo(modal,'confirm',function(){
      form.beforeSubmit()
      if (!form.valid) return
      CustomerActions.update(this.model.id, form.data, modal)
    })
    modal.show()
  }
})

const Collapsed = View.extend({
  template: `
      <div class="col-sm-12">
        <h4>Emails</h4>
        <span data-hook="emails"></span>
        <h4>description</h4>
        <span data-hook="description"></span>
      </div>
  `,
  derived: {
    emails: {
      deps: ['model.emails'],
      fn () {
        return this.model.emails.join(', ')
      }
    }
  },
  bindings: {
    'model.description': {
      hook:'description'
    },
    'emails': {
      hook:'emails'
    }
  }
})

module.exports = ListItem.extend({
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
  initialize(){
    ListItem.prototype.initialize.apply(this,arguments)
    this.model.on('change', () => this.render(), this);
    this.model.on('destroy', () => this.remove(), this);
  },
  render () {
    ListItem.prototype.render.apply(this,arguments)

    this.renderSubview(
      new CustomerButtons({ model: this.model }),
      this.query('div.panel-item.icons.panel-item-desktop[data-hook=action-buttons]')
    )

    this.renderSubview(
      new CustomerButtons({ model: this.model }),
      this.query('.panel-item-mobile ul.dropdown-menu[data-hook=action-buttons]')
    )

    this.renderSubview(
      new Collapsed({ model: this.model }),
      this.queryByHook('collapsed-content')
    )
  }
})
