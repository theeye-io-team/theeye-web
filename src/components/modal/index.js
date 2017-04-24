/**
 *
 * @author Facugon
 *
 * how to use.
 * 1. include
 * 2. instantiate
 * 3. render
 * 4. show
 * 5. tada!
 *
 * code :
 *
 * var modal = new Modal();
 * modal.render();
 * modal.show();
 *
 */
module.exports = function (specs) {
  var _template = require('./template.hbs');

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

    var backdrop = (typeof this.specs.backdrop == 'boolean') ? this.specs.backdrop : 'static';

    this.$el = $(this.el);
    this.$el.modal({
      show: false,
      keyboard: false,
      backdrop: backdrop
    });

    this.bindEvents();
    this.parent = div;

    return this.el;
  }

  this.render = function () {
    this.renderTemplate();

    if (this.specs.save_button===false) {
      this.queryByHook('save').remove();
    }
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

  this.close = function(){
    this.$el.modal('hide');
  }

  var _content;
  Object.defineProperty(this, 'content', {
    get: function(){ return _content; },
    set: function(view){
      var container = this.queryByHook('container');
      container.append( view.el );
    },
  });

  return this;
}
