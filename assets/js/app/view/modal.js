var Modal = function (specs) {
  var _template = Templates['assets/templates/modal.hbs'];

  this.specs = specs||(specs={});
  if(this.specs.autoRender === true){
    this.render();
  }

  this.queryByHook = function(name){
    return this.find('[data-hook=' + name +']');
  }

  this.find = function(selector){
    return this.$el.find(selector);
  }

  this.bindEvents = function(){
  }

  this.renderTemplate = function(){
    var div = document.createElement('div');
    div.setAttribute('data-hook','modal-container');
    document.getElementsByTagName('body')[0].appendChild(div);

    div.innerHTML = _template({
      title: this.specs.title,
      id: Date.now()
    });
    this.el = div.firstChild;

    this.$el = $(this.el);
    this.$el.modal({ show: false, keyboard: true });

    this.bindEvents();
    this.parent = div;

    return this.el;
  }

  this.render = function () {
    this.renderTemplate();
  }

  this.remove = function(){
    this.$el.remove();
    this.parent.remove();
  }

  this.show = function(){
    this.$el.modal('show');
  }

  this.hide = function(){
    this.$el.modal('hide');
  }

  var _content;
  Object.defineProperty(this, 'content', {
    get: function(){ return _content; },
    set: function(view){
      var container = this.queryByHook('container');
      container.appendChild( view.el );
    },
  });

  return this;
}
