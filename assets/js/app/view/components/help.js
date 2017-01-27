'use strict';

window.App||(window.App={});
window.App.Help = { icons: [] };

var HelpIcon = BaseView.extend({
  tagName: 'span',
  className: 'glyphicon glyphicon-question-sign',
  autoRender: true,
  initialize: function(options){
    BaseView.prototype.initialize.apply(this,arguments);

    this.category = (options.category||'help');
    this.container = (options.container||null);

    window.App.Help.icons.push( this );
  },
  events: {
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
  render: function() {
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
  }
})
