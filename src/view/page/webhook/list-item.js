import BaseView from 'view/base-view'
import ListItem from 'components/list/item'
import bootbox from 'bootbox'
import WebhookActions from 'actions/webhook'
import Modalizer from 'components/modalizer'
import merge from 'lodash/merge'
import WebhookForm from './form'
import Clipboard from 'clipboard'
import $ from 'jquery'

const WebhookButtons = BaseView.extend({
  template: `
    <div>
      <li>
        <button class="btn btn-primary" data-hook="workflow" title="Workflow">
          <span class="fa fa-sitemap dropdown-icon"></span>
          <span>Show workflow</span>
        </button>
      </li>
      <li>
        <button class="btn btn-primary" data-hook="edit" title="Edit">
          <span class="fa fa-edit dropdown-icon"></span>
          <span>Edit webhook</span>
        </button>
      </li>
      <li>
        <button class="btn btn-primary" data-hook="remove" title="Delete">
          <span class="fa fa-trash dropdown-icon"></span>
          <span>Delete webhook</span>
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
    $('.dropdown.open .dropdown-toggle').dropdown('toggle')
    window.open('/admin/workflow/' + this.model.id, '_blank');
    return false;
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
  template () {
    let model = this.model
    let html = `
      <div>
        <div class="row">
          <span class="col-xs-3">Name</span>
          <span class="col-xs-9">${model.name}</span>
        </div>
        <div class="row">
          <span class="col-xs-3">Hook Unique ID</span>
          <span class="col-xs-9">${model.id}</span>
        </div>
        <div class="row">
          <span class="col-xs-3">Trigger URL</span>
          <span class="col-xs-9">
            <div class="input-group">
              <input data-hook="trigger-url" type="text" class="form-control" readonly value="${model.triggerUrl}" />
              <span class="input-group-btn">
                <button data-hook="clipboard-url" class="btn btn-primary clipboard-token-btn clip" type="button">
                  <span class="fa fa-files-o" alt="copy to clipboard"></span>
                </button>
              </span>
            </div>
          </span>
        </div>
        <div class="row" style="padding:10px;"></div>
        <div class="row">
          <span class="col-xs-3">How to Trigger</span>
          <span class="col-xs-9">
            To Trigger push
            <button data-hook="trigger" class="btn btn-primary">
              This Button
            </button> ! Also, you can trigger this hook running this command via CLI (you required curl)
            <div class="input-group">
              <input data-hook="trigger-curl" type="text" class="form-control" readonly value="curl -X POST '${model.triggerUrl}'" />
              <span class="input-group-btn">
                <button data-hook="clipboard-curl" class="btn btn-primary clipboard-token-btn clip" type="button">
                  <span class="fa fa-files-o" alt="copy to clipboard"> </span>
                </button>
              </span>
            </div>
          </span>
        </div>
      </div>
      `
    return html
  },
  render () {
    this.renderWithTemplate(this)
    new Clipboard(this.queryByHook('clipboard-url'), { target: () => this.queryByHook('trigger-url') })
    new Clipboard(this.queryByHook('clipboard-curl'), { target: () => this.queryByHook('trigger-curl') })
  },
  events: {
    'click [data-hook=trigger]':'onClickTrigger',
  },
  onClickTrigger(event){
    event.preventDefault();
    event.stopPropagation();
    WebhookActions.trigger(this.model);
  },
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
  initialize(){
    ListItem.prototype.initialize.apply(this,arguments)
    this.model.on('change', () => this.render(), this);
    this.model.on('destroy', () => this.remove(), this);
  },
  render () {
    ListItem.prototype.render.apply(this,arguments)

    this.renderSubview(
      new WebhookButtons({ model: this.model }),
      this.query('div.panel-item.icons ul.dropdown-menu[data-hook=action-buttons]')
    )

    this.renderSubview(
      new CollapsedContent({ model: this.model }),
      this.queryByHook('collapsed-content')
    )
  }
})

const collapseTemplate = (model) => {
}
