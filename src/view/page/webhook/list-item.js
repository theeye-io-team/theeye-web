import BaseView from 'view/base-view'
import ListItem from 'components/list/item'
import bootbox from 'bootbox'
import WebhookActions from 'actions/webhook'
import Modalizer from 'components/modalizer'
import merge from 'lodash/merge'
import WebhookForm from './form'

const WebhookButtons = BaseView.extend({
  template: `
    <div>
      <li>
        <button class="btn btn-primary simple-btn tooltiped" data-hook="workflow" title="Workflow">
          <span class="fa fa-sitemap"></span>
        </button>
      </li>
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
    'click [data-hook=remove]':'onClickRemove',
    'click [data-hook=workflow]':'onClickWorkflow',
  },
  onClickWorkflow(event){
    event.preventDefault();
    event.stopPropagation();
    window.open('/admin/workflow?node=' + this.model.id, '_blank');
    return false;
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
    bootbox.confirm('Continue removing ' + model.get('name') + ' webhook ?', function(confirmed){
      if (confirmed) {
        WebhookActions.remove(model.id);
      }
    });
  },
  edit () {
    const model = this.model
    var form = new WebhookForm({ model: model })
    var modal = new Modalizer({
      title: 'Edit Incoming Webhook',
      confirmButton: 'Save',
      buttons: true,
      bodyView: form
    })

    this.listenTo(modal,'confirm',function(){
      WebhookActions.update(model.id,form.data)
      modal.hide()
    })
    this.listenTo(modal,'hidden',function(){
      form.remove()
      modal.remove()
    })
    this.listenTo(modal,'shown',function(){
      form.focus()
    })
    modal.show()
  }
})

const CollapsedContent = BaseView.extend({
  template: require('./collapsed.hbs'),
  events: {
    'click [data-hook=trigger]':'onClickTrigger',
  },
  onClickTrigger(event){
    event.preventDefault();
    event.stopPropagation();
    WebhookActions.trigger(this.model);
  },
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
      new WebhookButtons({ model: this.model }),
      this.query('div.panel-item.icons.panel-item-desktop[data-hook=action-buttons]')
    )

    this.renderSubview(
      new WebhookButtons({ model: this.model }),
      this.query('.panel-item-mobile ul.dropdown-menu[data-hook=action-buttons]')
    )

    this.renderSubview(
      new CollapsedContent({ model: this.model }),
      this.queryByHook('collapsed-content')
    )
  }
})
