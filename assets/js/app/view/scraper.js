/** 
 *
 * @author Facugon
 * @module Scraper
 *
 * global jquery
 * global select2
 * global Templates , compiled handlebars namespace
 *
 * FormElement = require(./form-element) 
 *
 */
var Scraper = (function Scraper(){

  function methodHasBody (method) {
    return method == 'POST' ||
      method == 'PUT' ||
      method == 'PATCH' ||
      method == 'OPTIONS' ||
      method == 'DELETE';
  }


  var FormView = (function(){
    var FormView = function(options){

      this.options = options;

      this.template = Templates['assets/templates/scraper-form.hbs'];

      if(!this.options.container){
        throw new Error('need a container. specify the DOM container element!');
      }

      this.parent = this.options.container;

      if( this.options.autoRender === true ){
        this.render();
      }

      var self = this;
      Object.defineProperty(this,'values',{
        get: function(){
          var form = new FormElement( self.$el[0] );
          return form.values();
        },
        set: function(values){
          var form = new FormElement( self.$el[0] );
          form.set( values );
          return self;
        },
        enumerable: true
      });
    }

    FormView.prototype.bindFormEvents = function(){
      var self = this;
      var $parent = $( this.parent );
      // binding form events
      $responseSection = this.find('section[data-hook=response]');
      $requestSection = this.find('section[data-hook=request]');

      $parent.on('click','[data-hook=response-section-toggle]',function(event){
        $responseSection.slideToggle();
        $("i", this).toggleClass("glyphicon-chevron-down glyphicon-chevron-up");
      });

      $parent.on('click','[data-hook=request-section-toggle]',function(event){
        $requestSection.slideToggle();
        $("i", this).toggleClass("glyphicon-chevron-down glyphicon-chevron-up");
      });

      $parent.on('click change','[data-hook=script]',function(event){
        self.find('[data-hook=script-parser-selection]').click();
      });

      $parent.on('click change','[data-hook=pattern]',function(event){
        self.find('[data-hook=match-pattern-selection]')
          .prop('checked', Boolean(this.value)); /// <<<< 'this' is the evented element
      });

      $parent.on('change','select[name=method]',function(event){
        $methods = self.find('select[name=method]');
        var method = $methods.val();
        var hasBody = methodHasBody(method);

        $bodyContainer = self.find('[data-hook=body-container]');
        if(hasBody) $bodyContainer.slideDown(80);
        else $bodyContainer.slideUp(80);
      });

      $parent.on('change','input[name=external]',function(event){
        var $container = self.queryByHook('external-hosts-container');
        if( this.checked === true ) {
          $container.slideDown(80);
        } else {
          $container.slideUp(80);
          $container.find("option:eq(0)").prop('selected', true);
        }
      });

      return this;
    }

    FormView.prototype.find = function(selector){
      return this.$el.find(selector);
    }

    FormView.prototype.renderTemplate = function(){
      this.el = this.template();
      this.$el = $(this.el);

      this.$el.appendTo( this.parent );
      this.bindFormEvents();
      
      return this.el;
    }

    FormView.prototype.queryByHook = function(name){
      return this.find('[data-hook=' + name +']');
    }

    FormView.prototype.render = function(options){
      options||(options={});
      this.renderTemplate();

      // initialize & render select2 combos
      this.queryByHook('tags').select2({
        placeholder: 'Tags',
        data: Select2Data.PrepareTags( this.options.tags ),
        tags: true
      });
      this.queryByHook('looptimes').select2({
        placeholder: 'Monitor Looptime',
        data: Select2Data.PrepareIdValueData( this.options.looptimes )
      });
      this.queryByHook('timeouts').select2({
        placeholder: 'Request Timeout',
        data: Select2Data.PrepareIdValueData( this.options.timeouts )
      });
      this.queryByHook('hosts').select2({
        placeholder: 'Monitor Host',
        data: Select2Data.PrepareHosts( this.options.hosts )
      });
      this.queryByHook('external_hosts').select2({
        placeholder: 'External Host',
        data: Select2Data.PrepareHosts( this.options.scraperHosts )
      });

      if( options.model ){
        this.values = options.model.attributes;
        if( ! options.model.isNew() ){
          this.queryByHook('hosts').select2({
            multiple:false
          });
        }
      }
    }

    FormView.prototype.remove = function(){
      this.$el.remove();
    }

    FormView.prototype.focus = function(){
      this.find('input[name=description]').focus();
    }

    return FormView;
  })();

  return {
    FormView: FormView,
  }

})();
