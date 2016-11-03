function CollectionRenderer (options) {
  var View = options.View;
  var container = options.container;
  var collection = options.collection;

  var views = [];

  function renderItem (item) {
    var view = new View({ model: item });
    view.render();
    views.push( view );
    container.appendChild( view.el );
  }

  collection.forEach(renderItem);

  function reRenderCollection(){
    views.forEach(function(view){ view.remove(); });
    if( collection.length > 0 ){
      collection.forEach(renderItem);
    }
  }

  //
  // keep the collection-view updated
  //
  collection.on('add',renderItem,this);
  collection.on('remove',function(){ console.log('item removed'); },this);
  collection.on('change',function(){ console.log('item updated'); },this);
  collection.on('sync',reRenderCollection);
  collection.on('reset',reRenderCollection);
}




var BaseView = Backbone.View.extend({
  initialize:function(options){
    _.extend(this,options);

    if( this.autoRender ) this.render();
  },
  renderTemplate: function(){
    var html = this.template(this.model||{});
    this.$el.html( html );

    if( this.container ) {
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
    new CollectionRenderer({
      collection: collection,
      View: View,
      container: container
    });
  }
});
