'use strict';

//var BaseView = require('../../base-view');
//var Templates = require('handlebars');
//var Select2Data = require('../../lib/select2data');

var MonitorCopy = (function(){

  var View = BaseView.extend({
    autoRender:true,
    tagName:'div',
    className:'form-group form-horizontal',
    template: Templates['assets/templates/components/monitor-copy.hbs'],
    initialize:function(){
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

      this.find('select').select2({
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
  });

  //module.exports = View;
  return View;
  
})();
