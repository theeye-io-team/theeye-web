'use strict';

window.App||(window.App={});
window.App.Help = { icons: [] };

var HelpIcon = BaseView.extend({
  tagName: 'span',
  className: 'fa fa-question-circle',
  autoRender: true,
  initialize: function(options){
    this.category = (options.category||'help');
    this.container = (options.container||null);
    this.color = (options.color||[48,66,105]);

    BaseView.prototype.initialize.apply(this,arguments);

    window.App.Help.icons.push( this );
  },
  events: {
    'mouseover': function(e) {
      this.$el.css('color','rgba(' + this.color.join(',') + ', 1)');
    },
    'mouseout': function(e) {
      this.$el.css('color','rgba(' + this.color.join(',') + ', 0.2)');
    },
    'click': function(e) {
      if (this.link) window.open(this.link, '_blank');
    }
  },
  show: function(){
    this.$el.show();
  },
  hide: function(){
    this.$el.hide();
  },
  render: function(){
    var $el = this.$el;
    $el.css('cursor','help');
    if (this.link) this.text += '. CLICK FOR MORE';
    $el[0].title = this.text;
    $el.tooltip();

    if (this.container) {
      if (this.container instanceof jQuery) {
        this.container.append(this.$el);
      }
    }
    this.$el.css('color','rgba(' + this.color.join(',') + ', 0.2)');
  },
  remove: function(){
    BaseView.prototype.remove.apply(this,arguments);
  }
})
