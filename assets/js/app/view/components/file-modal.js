'use strict';

//var BaseView = require('../base-view');

var FileModal = (function(){

  var Editor = BaseView.extend({
    initialize:function(options){
      var self = this;
      BaseView.prototype.initialize.apply(this,arguments);

      Object.defineProperty(this,'content',{
        get: function(){
          return self.ace.getSession().getValue().trim();
        },
        enumerable: true
      });
    },
    render: function(){
      var editor = ace.edit( this.queryByHook('ace-editor')[0] );
      editor.setTheme('ace/theme/twilight');
      editor.session.setMode('ace/mode/javascript');
      editor.setOptions({ maxLines: 20 });
      editor.$blockScrolling = Infinity
      editor.getSession().setValue('');
      this.ace = editor;
    },
    setFile: function(file) {
      var self = this,
        filename = file.name,
        reader = new FileReader();
      try {
        reader.onload = function(event) {
          var content = event.target.result;
          self.setContent(content,filename);
        };
        reader.readAsText(file);
      } catch (err) {
        alert('Sorry, we could not read your file. Try with a text file');
      }
    },
    setContent: function(content,filename) {
      var modelist = ace.require('ace/ext/modelist');
      var modeMeta = modelist.getModeForPath(filename);
      this.ace.session.setMode(modeMeta.mode);
      this.ace.getSession().setValue(content);
      return this;
    }
  });

  var DropOverlay = BaseView.extend({
    tagName:'div',
    className:'dropoverlay',
    stylize:function(){
      var self = this, $window = $(window);

      this.$el.css({
        'display': 'none',
        'width': '100%',
        'height': $window.height(),
        'z-index': 10100,
        'position': 'absolute',
        'top': 0,
        'left': 0,
        'background-color': 'rgba(0,0,0,0.5)',
        'background-image': 'url("/images/upload.png")',
        'background-repeat': 'no-repeat',
        'background-position': 'center',
        'background-size': '50%'
      });

      $window.on('resize', function(){
        self.$el.css('height',$window.height());
      });
    },
    events:{
      'drop':'onDrop',
      'dragdrop':'onDrop',
      'dragleave':'onDragLeave',
      'dragover':'onDragOver',
    },
    onDrop:function(event){
      event.preventDefault();
      event.stopPropagation();
      this.trigger('dropped',event);
      this.hide();
      return false;
    },
    onDragOver:function(event){
      event.preventDefault();
      event.stopPropagation();
      return false;
    },
    onDragLeave:function(event){
      event.preventDefault();
      event.stopPropagation();
      this.hide();
      return false;
    },
    show:function(){
      if (this.visible) return;
      this.visible = true;
      this.$el.show(0);
    },
    hide:function(){
      if (!this.visible) return;
      this.visible = false;
      this.$el.hide(0);
    },
    render:function(){
      var self = this;
      this.stylize();
      this.visible = false;
    },
    remove:function(){
      $(window).off('resize');
    }
  });

  var DropTarget = BaseView.extend({
    render:function(){
      var self = this, overlay, $body = $('body');
      overlay = this.overlay = new DropOverlay();
      overlay.render();
      overlay.on('dropped',function(event){
        self.trigger('dropped',event);
      });
      $body.append(this.overlay.$el);
    },
    remove:function(){
      BaseView.prototype.remove.apply(this, arguments);
      $(window).off('resize');
      this.overlay.remove();
    },
    events:{
      'dragover':'onDragOver',
      'dragenter':'onDragEnter',
      //'dragend':'onDragEnd',
      //'dragstart':'onDragStart',
      //'dragleave':'onDragLeave',
    },
    onDragOver:function(event){
      event.preventDefault();
      event.stopPropagation();
      return false;
    },
    onDragEnter:function(event){
      event.preventDefault();
      event.stopPropagation();
      this.overlay.show();
      return false;
    },
  });

  var FormView = BaseView.extend({
    template: Templates['assets/templates/file-form.hbs'],
    initialize:function(options){
      var self = this;
      // initialize parent to autoRender
      BaseView.prototype.initialize.apply(this,arguments);
      this.$description = this.find('input[name=description]');

      Object.defineProperty(this,'data',{
        get: function(){
          var form = new FormElement( self.$el[0] );
          var data = form.get();
          data.file = self.editor.content;
          return data;
        },
        set: function(data){
          var form = new FormElement( self.$el[0] );
          if (data.file) {
            self.editor.setContent(data.file, data.filename);
          }
          form.set( data );
          return self;
        },
        enumerable: true
      });
    },
    hideOptions:function(){
      this.find('.option').hide(0);
      return this;
    },
    showEditor:function(){
      this.editor.$el.show(0);
    },
    showUploader:function(){
      this.queryByHook('uploader').show(0);
    },
    showGist:function(){
      this.queryByHook('gist').show(0);
    },
    focus:function(){
      this.$description.focus();
    },
    events:{
      'change input[data-hook=file-selector]':'onChangeFileSelector',
      'click input[data-hook=edit]':'onClickEditor',
      'click input[data-hook=upload]':'onClickUpload',
      'click input[data-hook=gist]':'onClickGist',
    },
    render:function(){
      this.renderTemplate();

      this.editor = new Editor({
        autoRender: true,
        el: this.queryByHook('editor')
      });

      var dropTarget = this.dropTarget = new DropTarget({
        el: this.droppableContainer
      });
      dropTarget.render();

      this.listenTo(dropTarget,'dropped',this.onFileDropped);
    },
    processFile:function(file){
      this.data = { filename: file.name };
      this.editor.setFile(file);
    },
    onFileDropped:function(event){
      event.preventDefault();
      var file = event.originalEvent.dataTransfer.files[0];
      this.processFile(file);
    },
    onChangeFileSelector:function(event){
      event.preventDefault();
      var file = event.originalEvent.target.files[0];
      this.processFile(file);
    },
    onClickEditor: function(event){
      this.hideOptions();
      this.showEditor();
    },
    onClickUpload: function(event){
      this.hideOptions();
      this.showUploader();
    },
    onClickGist: function(event){
      this.hideOptions();
      this.showGist();
    },
    remove:function(){
      this.dropTarget.remove();
      this.editor.remove();
      BaseView.prototype.remove.apply(this,arguments);
    }
  });

  return BaseView.extend({
    initialize: function(options){
      options||(options={});
      this.title = options.title||'File';

      BaseView.prototype.initialize.apply(this,arguments);
    },
    render: function(){
      var self = this;
      var modal, title, formData,
        model = this.model,
        form = new FormView();

      if (model) {
        title = 'Editing file ' + model.get('filename');
        formData = model.attributes;
      }

      modal = new Modal({ title: title });
      modal.render();

      var droppable = modal.find('.modal-content')[0];
      form.droppableContainer = droppable;
      form.render();
      // set after render
      if (formData) form.data = formData;

      modal.$el.on('click','button[data-hook=save]',function(event){
        var data = form.data;
        if (self.model && !self.model.isNew()) {
          FileActions.update(model.id,data,form.editor.content);
        } else {
          FileActions.create(data,form.editor.content);
        }
      })
      modal.$el.on('shown.bs.modal', function(){
        form.focus();
      });
      modal.$el.on('hidden.bs.modal', function(){
        form.remove();
        modal.$el.off('click','button[data-hook=save]');
      });
      modal.queryByHook('container').append(form.$el);
      modal.show();
      this.modal = modal;
    },
    remove: function(){
      this.modal.close();
      BaseView.prototype.remove.apply(this);
    }
  });

})();
