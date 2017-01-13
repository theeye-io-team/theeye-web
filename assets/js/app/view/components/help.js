
var HelpIcon = BaseView.extend({
  tagName: 'span',
  className: 'glyphicon glyphicon-question-sign',
  autoRender: true,
  events: {
    'click':function(e){
      if (this.link) window.open(this.link, '_blank');
    }
  },
  render: function(){
    var $el = this.$el;
    $el.css('cursor','help');
    if (this.link) {
      this.text += '. CLICK FOR MORE';
    }
    $el[0].title = this.text;
    $el.tooltip();
  }
})
