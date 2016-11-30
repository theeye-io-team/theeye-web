'use strict';

//var BaseView = require('../../base-view');
//var Templates = require('handlebars');
//var Select2Data = require('../../lib/select2data');

var UsersSelect = (function(){

  var View = BaseView.extend({
    tagName:'div',
    className:'form-group form-horizontal',
    template: Templates['assets/templates/components/users-select.hbs'],
    initialize:function(){
      this.title = 'ACL';
      this.name = 'acl';
      BaseView.prototype.initialize.apply(this,arguments);

      Object.defineProperty(this,'values',{
        get: function(){ return this.find('select').val(); },
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
        placeholder: 'Users',
        data: Select2Data.PrepareIdValueData(
          this.collection.map(function(u){
            return {
              text: u.attributes.email,
              id: u.attributes.email
            };
          }),{
            id:'id',
            text:'text'
          }
        ),
        tags: true
      });

      this.find('.tooltiped').tooltip();
    },
  });

  // module.exports = View
  return View;

})();
