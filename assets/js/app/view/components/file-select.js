'use strict';

//var BaseView = require('../../base-view');
//var Templates = require('handlebars');
//var Select2Data = require('../../lib/select2data');
//var FileModal = require('./file-modal');

var FileSelect = (function(){

  var ActionButton = BaseView.extend({
    autoRender: true,
    tagName: 'div',
    className: 'col-sm-3',
		template: function(ctx){
      return '<button class="btn btn-block btn-primary">' + ctx.label + '</button>';
		},
    initialize:function(options){

      var self = this,
        _label = 'Create File';

      Object.defineProperty(this,'label',{
        get: function(){
          return _label;
        },
        set: function(label){
          _label = label;
          self.trigger('change');
          return this;
        }
      });

      BaseView.prototype.initialize.apply(this,arguments);

      this.on('change',this.render,this);
    },
    render:function(){
      this.renderTemplate();
    },
    events:{
      'click button':'onClickButton'
    },
    onClickButton:function(event){
      event.preventDefault();
      event.stopPropagation();

      var file = new FileModal();
      file.render();

      return false;
    },
    createMode:function(){
      this.label = 'Create File';
    },
    updateMode:function(id){
      this.label = 'Update File';
    },
  });

  var FileSelect = BaseView.extend({
    autoRender: true,
    tagName: 'div',
    className: 'form-group form-horizontal',
    template: Templates['assets/templates/components/input-select.hbs'],
    initialize: function(options){
      this.label = 'Files';
      this.name = 'file';
      this.help = 'All the uploaded files including scripts, configurations, etc';
      this.selected = options.selected||null;

      this.collection = FilesStore.files;

      BaseView.prototype.initialize.apply(this,arguments);

      Object.defineProperty(this,'value',{
        get: function(){
          return this.find('select').val(); 
        },
        set: function(value){
          var select = this.find('select');
          select.val( value );
          select.trigger('change');
          return this;
        }
      });
    },
    events: {
      'change select':function(event){
        if (!this.value) {
          this.button.createMode();
        } else {
          this.button.updateMode(this.value);
        }
        this.trigger('change',this.value);
      }
    },
    renderFilesSelect: function(){
      var options = { id:'id', text:'text' },
        data = Select2Data.PrepareIdValueData(
          this.collection.map(function(i){
            return {
              text: i.get('filename'),
              id: i.get('id')
            };
          }), options
        );

      this.find('select').select2({
        placeholder: 'Select a file',
        data: data,
        allowClear: true
      });

      if (this.selected) {
        this.find('select').val(this.selected).trigger('change');
      }
    },
    renderActionButton: function(){
      this.queryByHook('select-container')[0].className = 'col-sm-6';
      var button = this.button = new ActionButton();
      this.$el.append(button.$el);
    },
    render: function(){
      this.renderTemplate();
      this.renderActionButton();
      this.renderFilesSelect();

      this.find('.tooltiped').tooltip();

      FilesStore.addChangeListener(this.onFilesChange,this);
    },
    onFilesChange:function(){
      console.log('files store changed');
    },
    remove: function(){
      BaseView.prototype.remove.apply(this);
      this.off('change');
      FilesStore.removeChangeListener(this.onFilesChange,this);
    }
  });

  return FileSelect;

})();

//module.exports = View;
