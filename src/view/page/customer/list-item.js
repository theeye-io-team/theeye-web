import BaseView from 'view/base-view'
import ListItem from 'components/list/item'
import bootbox from 'bootbox'
import CustomerActions from 'actions/customer'
import Modalizer from 'components/modalizer'
import merge from 'lodash/merge'
import View from 'ampersand-view'
import CustomerForm from './form'
import $ from 'jquery'

export default ListItem.extend({
  derived: {
    item_name: {
      deps: ['model.view_name'],
      fn () {
        return this.model.view_name
      }
    },
    item_description: {
      deps: ['model.id'],
      fn () {
        return 'unique id ' + this.model.id
      }
    }
  },
  initialize () {
    ListItem.prototype.initialize.apply(this,arguments)

    this.model.on('change', () => this.render(), this);
    this.model.on('destroy', () => this.remove(), this);
  },
  render () {
    ListItem.prototype.render.apply(this,arguments)

    this.renderSubview(
      new CustomerButtons({ model: this.model }),
      this.query('div.panel-item.icons ul.dropdown-menu[data-hook=action-buttons]')
    )

    this.renderSubview(
      new Collapsed({ model: this.model }),
      this.queryByHook('collapsed-content')
    )
  }
})

const CustomerButtons = BaseView.extend({
  template: `
    <div>
      <li>
        <button class="btn btn-primary" data-hook="edit" title="Edit">
          <span class="fa fa-edit dropdown-icon"></span>
          <span>Edit customer</span>
        </button>
      </li>
      <li>
        <button class="btn btn-primary" data-hook="remove" title="Delete">
          <span class="fa fa-trash dropdown-icon"></span>
          <span>Delete customer</span>
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
    $('.dropdown.open .dropdown-toggle').dropdown('toggle')

    this.edit();
  },
  onClickRemove(event){
    event.preventDefault();
    event.stopPropagation();
    $('.dropdown.open .dropdown-toggle').dropdown('toggle')

    var model = this.model;
    bootbox.confirm('Continue removing ' + model.get('view_name') + ' customer ?', function(confirmed){
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
  <div class="row">
      <div class="col-sm-12">
        <h4>Name</h4>
        <span data-hook="name"></span>
      </div>

      <div class="col-sm-12">
        <h4>Description</h4>
        <span data-hook="description"></span>
      </div>

      <div class="col-sm-12">
        <h4>Display Name</h4>
        <span data-hook="display_name"></span>
      </div>

      <div class="col-sm-12">
        <h4>Creation At</h4>
        <span data-hook="creation_date"></span>
      </div>

  </div>
  `,
  bindings: {
    'model.name': { hook: 'name' },
    'model.description': { hook: 'description' },
    display_name: { hook: 'display_name' },
    'model.creation_date': { hook: 'creation_date' }
  },
  derived: {
    isplay_name: {
      deps: ['model.display_name'],
      fn () {
        return this.model.display_name || 'Not Set'
      }
    }
  }
})
