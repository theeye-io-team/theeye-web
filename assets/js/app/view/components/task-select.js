'use strict';

//var BaseView = require('../../base-view');
//var Templates = require('handlebars');
//var Select2Data = require('../../lib/select2data');

var TaskSelect = BaseView.extend({
  autoRender:true,
  tagName:'div',
  className:'form-group form-horizontal',
  template: Templates['assets/templates/components/task-select.hbs'],
  initialize:function(options){
    this.label = (options.label||'Copy Task');

    BaseView.prototype.initialize.apply(this,arguments);

    Object.defineProperty(this,'values',{
      get: function(){
        return this.find('select').val(); 
      },
      set: function(values){
        var select = this.find('select');
        select.val( values );
        select.trigger('change');
        return this;
      }
    });
  },
  events:{
    'change select':function(event){
      this.trigger('change', this.values);
    }
  },
  render:function(){
    this.renderTemplate();

    this.help = new HelpIcon({
      text: HelpTexts.task.copy
    });
    this.help.$el.appendTo(this.find('label'));

    var options = { id:'id', text:'text' },
      data = Select2Data.PrepareIdValueData(
        this.collection.map(function(t){
          var host = t.get('host');
          return {
            text: t.get('name') + ' (' + (host?host.hostname:'no host') + ')',
            id: t.get('id')
          };
        }), options
      );

    this.find('select').select2({
      tabindex: 0,
      placeholder: 'Select a task',
      data: data,
      allowClear: true
    });

    this.find('.tooltiped').tooltip();
  },
  remove:function(){
    BaseView.prototype.remove.apply(this);
    this.help.remove();
    this.off('change');
  }
});

//module.exports = View;
