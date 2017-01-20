'use strict';

//var BaseView = require('../base-view');

var FileModal = (function(){

  var modal;

  var Editor = BaseView.extend({
    initialize:function(options){
      var self = this;
      BaseView.prototype.initialize.apply(this,arguments);

      Object.defineProperty(this,'data',{
        get: function(){
          return self.ace.getSession().getValue().trim();
        },
        set: function(source){
          self.ace.getSession().setValue(source);
          return self;
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

      this.ace = editor;
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
    autoRender:true,
    initialize:function(options){
      var self = this;
      // initialize parent to autoRender
      BaseView.prototype.initialize.apply(this,arguments);
      this.$description = this.find('input[name=description]');

      Object.defineProperty(this,'data',{
        get: function(){
          var form = new FormElement( self.$el[0] );
          var data = form.get();
          var source = this.editor.data;
          data.file = btoa(unescape(encodeURIComponent(source)));
          return data;
        },
        set: function(data){
          var form = new FormElement( self.$el[0] );
          //if (data.file) {
          //  this.editor.data = ;
          //}
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

      var droppable = modal.find('.modal-content')[0];
      var dropTarget = this.dropTarget = new DropTarget({
        el: droppable
      });
      dropTarget.render();

      this.listenTo(dropTarget,'dropped',this.onFileDropped);
    },
    processFile:function(file){
      var reader = new FileReader();
      var self = this;
      try {
        reader.onload = function(event) {
          var filename = file.name,
            content = event.target.result;

          self.data = { filename: filename };

          var modelist = ace.require('ace/ext/modelist');
          var modeMeta = modelist.getModeForPath(filename);
          self.editor.ace.session.setMode(modeMeta.mode);
          self.editor.ace.getSession().setValue(content);
        };
        reader.readAsText(file);
      } catch (err) {
        alert('We could not read your file, sorry. Try again with a text file');
      }
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

  var FileModal = BaseView.extend({
    initialize:function(options){
      options||(options={});
      this.title = options.title||'File';

      BaseView.prototype.initialize.apply(this,arguments);
    },
    render: function(){
      var form;

      modal = new Modal({ title: this.title });
      modal.render();

      form = new FormView();

      modal.$el.on('click','button[data-hook=save]',function(event){
        var data = form.data;
        if (self.model&&self.model.isNew()) {
          FileActions.update(model.id,data,form.editor.data);
        } else {
          FileActions.create(data,form.editor.data);
        }
      })

      FilesStore.addChangeListener(this.onFilesChange,this);

      modal.$el.on('shown.bs.modal', function(){
        form.focus();
      });
      modal.$el.on('hidden.bs.modal', function(){
        form.remove();
        modal.$el.off('click','button[data-hook=save]');
      });
      modal.queryByHook('container').append(form.$el);
      modal.show();
    },
    onFilesChange:function(){
      modal.close();
    },
    remove:function(){
      FilesStore.removeChangeListener(this.onFilesChange);
      BaseView.prototype.remove.apply(this);
    }
  });

  return FileModal;

})();
