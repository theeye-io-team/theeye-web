function CollectionRenderer (options) {
  var View = options.View;
  var container = options.container;
  var collection = options.collection;
  var views = new Backbone.Collection(); 

  function renderItemView (item) {
    var view = new View({model:item});
    view.render();
    views.add({
      id:item.get('id'),
      view:view 
    });
    container.appendChild(view.el);
    return view;
  }

  function removeItemView (item) {
    console.warn('remove item not implemented');
  }

  function changeItemView (item) {
    //var id = item.get('id');
    //var view = views.get(id).get('view');
    //view.remove();
    //view.model;
    //view.render();
  }

  collection.forEach(renderItemView);
  //
  // keep the collection-view updated
  //
  collection.on('add',renderItemView,this);
  collection.on('remove',removeItemView,this);
  collection.on('change',changeItemView,this);
  collection.on('sync',function(){},this);
  collection.on('reset',function(){},this);

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
  renderCollection: function(collection, View, container) {
    return new CollectionRenderer({
      collection: collection,
      View: View,
      container: container
    });
  },
  remove:function(){
    Backbone.View.prototype.remove.apply(this,arguments);
  }
});
