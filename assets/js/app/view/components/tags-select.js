'use strict';

//var BaseView = require('../../base-view');
//var Templates = require('handlebars');
//var Select2Data = require('../../lib/select2data');

var TagsSelect = (function(){

  var View = BaseView.extend({
    tagName:'div',
    className:'form-group form-horizontal',
    template: Templates['assets/templates/components/tags-select'],
    initialize:function(){
      this.title = 'Tags [optional]';
      this.name = 'tags';
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

      this.help = new HelpIcon({
        container: this.find('label'),
        text: HelpTexts.tags
      });

      this.find('select').select2({
        tabindex: 0,
        placeholder: 'Users',
        data: Select2Data.PrepareTags( this.collection ),
        tags: true
      });

      this.find('.tooltiped').tooltip();
    },
    remove:function(){
      BaseView.prototype.remove.apply(this,arguments);
      this.help.remove();
    }
  });

  // module.exports = View
  return View;

})();
