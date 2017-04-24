'use strict';

var View = require('ampersand-view')
var $ = require('jquery')

module.exports = View.extend({
  template: `<span class="fa fa-question-circle"></span>`,
  autoRender: true,
  initialize: function(options){
    View.prototype.initialize.apply(this,arguments)

    this.container = options.container || null
    this.link = options.link || null
    this.color = options.color || [48,66,105]
  },
  events: {
    'mouseover': function(e) {
      $(this.el).css('color','rgba(' + this.color.join(',') + ', 1)');
    },
    'mouseout': function(e) {
      $(this.el).css('color','rgba(' + this.color.join(',') + ', 0.2)');
    },
    'click': function(e) {
      if (this.link) window.open(this.link, '_blank');
    }
  },
  show: function(){
    $(this.el).show();
  },
  hide: function(){
    $(this.el).hide();
  },
  render: function(){
    this.renderWithTemplate();

    var $el = $(this.el);
    $el.css('cursor','help');
    if (this.link) this.text += '. CLICK FOR MORE';
    $el[0].title = this.text;
    $el.tooltip();

    if (this.container) {
      if (this.container instanceof jQuery) {
        this.container.append($el);
      }
    }
    $el.css('color','rgba(' + this.color.join(',') + ', 0.2)');
  }
})
