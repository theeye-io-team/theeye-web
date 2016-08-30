var Scraper = (function Scraper(){

  var FormView = (function(){
    var FormView = function(options){
      this.template = Templates['assets/templates/scraper-form.hbs'];
      this.options = options;
      if( this.options.autoRender === true ){
        this.render();
      }
    }

    FormView.prototype.find = function(selector){
      return $(this.el).find(selector);
    }

    FormView.prototype.renderTemplate = function(){
      this.el = this.template();
      this.$el = $(this.el);

      if( this.options.container ){
        this.$el.appendTo( this.options.container );
      }
      return this.el;
    }

    FormView.prototype.render = function(){
      this.renderTemplate();
    }

    FormView.prototype.remove = function(){
      this.$el.remove();
    }

    return FormView;
  })();

  return {
    FormView: FormView,
  }

})();
