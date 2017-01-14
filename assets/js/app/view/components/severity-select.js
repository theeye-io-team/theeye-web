'use strict';

//var BaseView = require('../../base-view');
//var Templates = require('handlebars');
//var Select2Data = require('../../lib/select2data');

var SeveritySelect = BaseView.extend({
  autoRender: true,
  tagName: 'div',
  className: 'form-group form-horizontal',
  template: Templates['assets/templates/components/input-select.hbs'],
  initialize: function(options){
    this.label = 'Severity';
    this.name = 'failure_severity';
    this.help = 'Monitor serverity LOW, HIGH, CRITICAL';
    this.selected = options.selected||null;
    this.collection = new Backbone.Collection([
      { id: 'LOW', text: 'LOW' },
      { id: 'HIGH', text: 'HIGH' },
      { id: 'CRITICAL', text: 'CRITICAL' }
    ]);

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
  events: {
    'change select':function(event){
      this.trigger('change', this.values);
    }
  },
  render: function(){
    this.renderTemplate();

    var options = { id:'id', text:'text' },
      data = Select2Data.PrepareIdValueData(
        this.collection.map(function(i){
          return {
            text: i.get('text'),
            id: i.get('id')
          };
        }), options
      );

    this.find('select').select2({
      placeholder: 'Select a task',
      data: data,
      allowClear: true
    });

    if (this.selected) {
      this.find('select').val(this.selected).trigger('change');
    }

    this.find('.tooltiped').tooltip();
  },
  remove: function(){
    BaseView.prototype.remove.apply(this);
    this.off('change');
  }
});

//module.exports = View;
