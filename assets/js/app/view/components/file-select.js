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
      return '<button data-mode="' + ctx.mode + '" class="btn btn-block btn-primary">' + ctx.label + '</button>';
    },
    initialize: function(options){
      var self = this;
      this.label = 'Create File';
      this.mode = App.Constants.FILE_CREATE;

      BaseView.prototype.initialize.apply(this,arguments);

      this.on('change',this.render,this);
    },
    render: function(){
      this.renderTemplate();
    },
    events: {
      'click button':'onClickButton'
    },
    onClickButton: function(event){
      event.preventDefault();
      event.stopPropagation();
      this.trigger('click',{ mode: this.mode });
      return false;
    },
    createMode: function(){
      this.label = 'Create File';
      this.mode = App.Constants.FILE_CREATE;
      this.trigger('change');
    },
    updateMode: function(id){
      this.label = 'Edit File';
      this.mode = App.Constants.FILE_UPDATE;
      this.trigger('change');
    },
  });

  return BaseView.extend({
    autoRender: true,
    tagName: 'div',
    className: 'form-group form-horizontal',
    template: Templates['assets/templates/components/input-select.hbs'],
    initialize: function(options){
      this.label = 'Files';
      this.name = 'file';
      this.help = 'All the uploaded files including scripts, configurations, etc';
      this.selected = (options.selected||null);

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
      'change select': function(event){
        if (!this.value) {
          this.button.createMode();
        } else {
          this.button.updateMode(this.value);
        }
        this.selected = this.value;
        this.trigger('change',this.value);
      }
    },
    renderFilesSelect: function(){
      var $select = this.find('select');

      $select.select2({}).select2('destroy').empty().html('<option></option>');

      var options = { id:'id', text:'text' },
        data = Select2Data.PrepareIdValueData(
          FilesStore.files.map(function(i){
            return {
              text: i.get('filename'),
              id: i.get('id')
            };
          }), options
        );

      $select.select2({
        tabindex: 0,
        placeholder: 'Select a file',
        data: data,
        allowClear: true
      });

      if (this.selected) {
        this.find('select')
          .val(this.selected)
          .trigger('change');
      }
    },
    renderActionButton: function(){
      var self = this;
      this.queryByHook('select-container')[0].className = 'col-sm-6';
      var button = this.button = new ActionButton();
      this.$el.append(button.$el);

      this.listenTo(button,'click',function(event){
        var modal = this.fileModal = new FileModal();
        if (event.mode === App.Constants.FILE_CREATE) {
          modal.render();
        } else if (event.mode === App.Constants.FILE_UPDATE) {
          modal.model = FilesStore.files.get(this.selected); // selected file id.
          if (modal.model.get('file')) {
            modal.render();
          } else {
            modal.listenTo(modal.model,'change:file',function(){
              modal.render();
              modal.model.off('change:file');
            });
            // start download and wait
            FileActions.download(this.selected);
          }
        }
      });
    },
    render: function(){
      this.fileModal;

      this.renderTemplate();
      this.renderActionButton();
      this.renderFilesSelect();

      this.find('.tooltiped').tooltip();

      this.help = new HelpIcon({
        container: this.find('label'),
        text: HelpTexts.file.select
      });

      FilesStore.addChangeListener(this.onFilesChange,this);
    },
    /**
     *
     * listen to diferent file store events and react to them.
     * basically, there are other views(childs) that depends on this one,
     * so this view interactar directly with the store and
     * change the behaviour of the childs.
     */
    onFilesChange:function(action){
      console.log('files store changed');

      var type = action.actionType,
        modal = this.fileModal;

      if (
        type===App.Constants.FILE_CREATE||
        type===App.Constants.FILE_UPDATE
      ) {
        this.selected = action.file.get('id'); // affected model
        this.renderFilesSelect();
        if (modal) modal.remove();
      }
    },
    remove: function(){
      BaseView.prototype.remove.apply(this);
      this.off('change');
      this.help.remove();
      FilesStore.removeChangeListener(this.onFilesChange,this);
    }
  });

})();

//module.exports = View;
