function CollectionRenderer (specs) {
  var View = specs.View;
  var container = specs.container;
  var collection = specs.collection;
  var views = []; 
  var options = (specs.options||{});

  function renderItemView (item) {
    var view = new View({model:item});
    view.render();
    views.push(view);
    container.appendChild(view.el);
    return view;
  }

  function itemRemoved (item) {
    console.warn('remove item not implemented');
  }

  function itemChange (item) {
    console.log('item changed');
  }

  if (collection.length>0) {
    collection.forEach(renderItemView);
  }

  // keep the collection-view updated
  collection.on('add',function(item){
    renderItemView(item);
  },this);

  collection.on('remove',function(item){
    itemRemoved(item);
  },this);

  collection.on('change',function(item){
    itemChange(item);
  },this);

  //collection.on('sync',function(){},this);
  //collection.on('reset',function(){},this);

  this.collection = collection;
  this.views = views;
  this.container = container;

  return this;
}

var BaseView = Backbone.View.extend({
  initialize:function(options){
    _.extend(this,options);
    if (this.autoRender) this.render();
  },
  renderTemplate: function(){
    var html = this.template(this||{});
    this.$el.html( html );

    if (this.container) {
      this.container.appendChild( this.el );
    }

    return this;
  },
  queryByHook : function(hook){
    return this.find('[data-hook=' + hook +']');
  },
  find : function(selector){
    return this.$el.find(selector);
  },
  render: function(){
    this.renderTemplate();
  },
  renderCollection: function(collection, View, container, options) {
    return new CollectionRenderer({
      collection: collection,
      View: View,
      container: container,
      options: options||{}
    });
  },
  remove:function(){
    Backbone.View.prototype.remove.apply(this,arguments);
  }
});
