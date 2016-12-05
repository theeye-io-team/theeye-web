'use strict';

//var BaseView = require('../../base-view');
//var Templates = require('handlebars');
//var Select2Data = require('../../lib/select2data');

var MonitorSelect = BaseView.extend({
  autoRender:true,
  tagName:'div',
  className:'form-group form-horizontal',
  template: Templates['assets/templates/components/monitor-select.hbs'],
  initialize:function(options){
    this.label = options.label||'Monitos';
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

    var options = { id:'id', text:'text' },
      data = Select2Data.PrepareIdValueData(
        this.collection.map(function(u){
          return {
            text: u.get('name') + ' (' + u.get('resource').hostname + ')',
            id: u.get('id')
          };
        }), options
      );

    this.find('select').select2({
      placeholder: 'Select a monitor',
      data: data,
      allowClear: true
    });

    this.find('.tooltiped').tooltip();
  },
  remove:function(){
    BaseView.prototype.remove.apply(this);
    this.off('change');
  }
});

//module.exports = View;
