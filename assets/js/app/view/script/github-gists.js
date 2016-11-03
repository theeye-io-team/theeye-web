
var Github = {};
Github.Gist = (function(){

  var Actions = {};

  this.SaveToGistButton = BaseView.extend({
    el: $('<span></span>')[0],
    template:function(){
      return '<button class="btn btn-default"><span>Save To Gist</span></button>';
    },
    events:{
      "click button":"onClickButton",
    },
    onClickButton:function(event){
      event.preventDefault();
      return false;
    },
  });

  return this;

})();
