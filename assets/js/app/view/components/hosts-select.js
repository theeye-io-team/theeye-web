'use strict';

//var BaseView = require('../../base-view');
//var Templates = require('handlebars');
//var Select2Data = require('../../lib/select2data');

var HostsSelect = BaseView.extend({
  autoRender:true,
  tagName:'div',
  className:'form-group form-horizontal',
  template: Templates['assets/templates/components/hosts-select.hbs'],
  initialize:function(){
    this.label = 'Copy to';

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
  render:function(){
    this.renderTemplate();

    this.help = new HelpIcon({
      text: HelpTexts.monitor.copy
    });
    this.help.$el.appendTo(this.find('label'));

    this.find('select').select2({
      tabindex: 0,
      placeholder: 'Hosts',
      data: Select2Data.PrepareIdValueData(
        this.collection.map(function(u){
          return {
            text: u.get('hostname'),
            id: u.get('id')
          };
        }),{
          id:'id',
          text:'text'
        }
      ),
      multiple: true
    });

    this.find('.tooltiped').tooltip();
  },
  remove:function(){
    BaseView.prototype.remove.apply(this);
    this.help.remove();
  }
});
//module.exports = View;
