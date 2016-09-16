
var BaseView = Backbone.View.extend({
  renderTemplate: function(){
    var html = this.template();
    this.$el.html( html );

    if( this.targetEl )
      this.targetEl.appendChild( this.$el[0] );

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
  }
});
