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

  var FormView = BaseView.extend({
    template : Templates['assets/templates/scraper-form.hbs'],
    initialize : function(options){
      var self = this;

      _.extend(this, options);

      Object.defineProperty(this,'data',{
        get: function(){
          var form = new FormElement( self.$el[0] );
          return form.get();
        },
        set: function(data){
          var form = new FormElement( self.$el[0] );
          form.set( data );
          return self;
        },
        enumerable: true
      });

    },
    bindFormEvents : function(){
      var self = this;
      var $parent = this.$el;

      // binding form events
      $advancedSection = this.find('section[data-hook=advanced]');
      $parent.on('click','[data-hook=advanced-section-toggler]',function(event){
        $advancedSection.slideToggle();
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

      this.find('span.tooltiped').tooltip();

      return this;
    },
    render : function(options){
      options||(options={});
      this.renderTemplate();
      this.bindFormEvents();
      this.setupSelect();
      this.setFormData(options.model);
    },
    setFormData : function(model) {
      if( model ){
        this.data = model.attributes;
        if( model.isTemplate === true ){
          this.queryByHook('hosts-container').remove();
        } else if( ! model.isNew() ){
          this.queryByHook('hosts').select2({
            multiple:false
          });
        }
      }
    },
    setupSelect : function() {
      // initialize & render select2 combos
      this.queryByHook('tags').select2({
        placeholder: 'Tags',
        data: Select2Data.PrepareTags( this.tags ),
        tags: true
      });
      this.queryByHook('looptimes').select2({
        placeholder: 'Monitor Looptime',
        data: Select2Data.PrepareIdValueData( this.looptimes )
      });
      this.queryByHook('timeouts').select2({
        placeholder: 'Request Timeout',
        data: Select2Data.PrepareIdValueData( this.timeouts )
      });
      this.queryByHook('hosts').select2({
        placeholder: 'Monitor Host',
        data: Select2Data.PrepareHosts( this.hosts )
      });
      this.queryByHook('external_hosts').select2({
        placeholder: 'External Host',
        data: Select2Data.PrepareHosts( this.scraperHosts )
      });
    },
    remove : function(){
      this.$el.off('click');
      this.$el.off('change');
      BaseView.prototype.remove.call(this);
    },
    focus : function(){
      this.find('input[name=description]').focus();
    }
  });

  var TaskFormView = FormView.extend({
    render: function() {
      // parent render
      this.renderTemplate();
      this.bindFormEvents();
      this.setupSelect();

      var triggerInputsHTML = Templates['assets/templates/trigger-inputs.hbs']();
      this.queryByHook('advanced').append( triggerInputsHTML );
      this.queryByHook('events-container').select2({
        placeholder: 'Events',
        data: Select2Data.PrepareEvents( this.events )
      });

      this.setFormData(this.model);
    }
  });

  return {
    FormView: FormView,
    TaskFormView: TaskFormView
  }

})();
