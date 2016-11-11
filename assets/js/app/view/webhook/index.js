/* global Modal, Clipboard, App, bootbox, BaseView, Templates, _, FormElement, ListView*/
/**
 *
 * kind of modular structure
 * @author Facugon
 *
 */
var WebhookPage = (function(){

  // use only one main modal for the page.
  var modal = new Modal({ title: 'Incoming Webhook' });
  modal.render();

  // webhooks collection
  var webhooks = new App.Collections.Webhooks();

  new Clipboard('.clip');

  var WebhookActions = {
    remove:function(webhook){
      webhook.destroy({
        success:function(){
          bootbox.alert('Webhook Deleted',function(){ });
          webhooks.remove( webhook );
        }
      });
    },
    update:function(webhook){
      webhook.save({},{
        success:function(){
          bootbox.alert('Webhook Updated',function(){ });
        }
      });
    },
    create:function(webhook){
      webhook.save({},{
        success:function(){
          bootbox.alert('Webhook Created',function(){ });
          webhooks.add( webhook );
        }
      });
    },
    trigger:function(webhook){
      $.ajax({
        method:'POST',
        url:webhook.triggerUrl,
        dataType:'json'
      }).done(function(data){
        bootbox.alert('Webhook triggered');
      }).fail(function(xhr,status){
        bootbox.alert('Webhook trigger error');
      });
    }
  };

  var WebhookFormView = BaseView.extend({
    template: Templates['assets/templates/webhook/form.hbs'],
    initialize : function(options){
      var self = this;

      _.extend(this, options);

      Object.defineProperty(this,'data',{
        get: function(){
          var form = new FormElement( self.$el[0] );
          return form.get();
        },
        set: function(data){
          var form = new FormElement( self.$el[0] );
          form.set( data );
          return self;
        },
        enumerable: true
      });
    },
    render:function(){
      this.renderTemplate();
      if( this.model ){
        this.data = this.model.attributes;
      }
    },
    focus:function(){
      this.find('input[name=name]').focus();
    },
  });

  var WebhookView = BaseView.extend({
    template: Templates['assets/templates/webhook/list-item.hbs'],
    events: {
      "click [data-hook=edit]":"onClickEdit",
      "click [data-hook=remove]":"onClickRemove",
      "click [data-hook=trigger]":"onClickTrigger",
      "click [data-hook=workflow-button]":"onClickWorkflow",
    },
    onClickWorkflow:function(event){
      window.open('/admin/workflow?node=' + this.model.id, '_blank');
      return false;
    },
    onClickEdit:function(event){
      event.preventDefault();
      event.stopPropagation();
      this.edit();
    },
    onClickRemove:function(event){
      event.preventDefault();
      event.stopPropagation();
      WebhookActions.remove(this.model);
    },
    onClickTrigger:function(event){
      event.preventDefault();
      event.stopPropagation();
      WebhookActions.trigger(this.model);
    },
    initialize:function(){
      BaseView.prototype.initialize.apply(this, arguments);
      var form = new WebhookFormView({ model: this.model });
      this.form = form;

      // re render item on change
      this.model.on('change',function(){
        this.render();
      },this);

      this.model.on('destroy',function(){
        this.remove();
      },this);
    },
    edit:function(){
      var form = this.form,
        model = this.model;

      modal.$el.one('shown.bs.modal', function(){
        form.focus();
      });

      modal.$el.one('hidden.bs.modal', function(){
        form.remove();
        modal.$el.off('click','button[data-hook=save]');
      });

      modal.$el.on('click','button[data-hook=save]',function(){
        model.set(form.data);
        WebhookActions.update(model);
      });

      form.container = modal.queryByHook('container')[0];
      form.render();
      modal.show();
    },
    remove:function(){
      BaseView.prototype.remove.apply(this, arguments);
      this.form.remove();
    }
  });

  // Extend ListView for massChecker/massDeleter functionality
  var WebhookPage = ListView.extend({
    autoRender: true,
    template: Templates['assets/templates/webhook/page.hbs'],
    container: $('div[data-hook=webhook-page-container]')[0],
    events: function(){
      var evts = {
        "click [data-hook=create]":"onClickCreate",
      };
      //extend the listView default events (massDelete/check/uncheck)
      return _.extend({}, ListView.prototype.defaultEvents, evts);
    },
    //Extended setup for massDeleter
    itemTitle: 'Webhook',
    itemTitlePlural: 'Webhooks',
    itemNoun: 'webhook',
    itemNounPlural: 'webhooks',
    apiUrlEndpoint: '/api/webhook/',

    create:function(){
      var webhook = new App.Models.Webhook();
      var form = new WebhookFormView({ model: webhook });
      form.container = modal.queryByHook('container')[0];
      form.render();

      modal.$el.one('shown.bs.modal', function(){
        form.focus();
      });
      modal.$el.one('hidden.bs.modal', function(){
        form.remove();
        modal.$el.off('click','button[data-hook=save]');
      });
      modal.$el.on('click','button[data-hook=save]',function(){
        webhook.set(form.data);
        WebhookActions.create(webhook);
      });

      modal.show();
    },
    onClickCreate:function(event){
      event.preventDefault();
      event.stopPropagation();

      this.create();
    },
    render:function(){
      var self = this;
      BaseView.prototype.render.apply(this, arguments);

      // bind searchbox input
      $.searchbox();

      this.renderCollection(
        this.collection,
        WebhookView,
        self.queryByHook('webhooks-container')[0]
      );
    }
  });

  // kind of page router/controller
  return function () {
    new WebhookPage({ collection: webhooks });
    // fetch before render
    webhooks.fetch({
      success:function(){ }
    });
  };

})();
