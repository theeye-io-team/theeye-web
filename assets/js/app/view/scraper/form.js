/** 
 *
 * @author Facugon
 * @namespace Views
 * @module Scraper
 *
 */

// var jQuery = require('jquery');
// var Select2 = require('select2');
// var Templates = require('templates'); // compiled handlebars templates, dont know where will be put exactly

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
      var $advancedSection = this.find('section[data-hook=advanced]');
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

      this.find('span.tooltiped').tooltip();

      return this;
    },
    render : function(options){
      options||(options={});
      this.renderTemplate();
      this.setupSelect();
      this.bindFormEvents();
      this.initHelp();

      this.setFormData(options.model);
    },
    initHelp: function() {
      new HelpIcon({
        container: this.find('label[for=name]'),
        category: 'scraper_form',
        text: 'Give it a name.'
      });
      new HelpIcon({
        container: this.find('label[for=host]'),
        category: 'scraper_form',
        text: 'Where it has to run?'
      });
      new HelpIcon({
        container: this.find('label[for=looptime]'),
        category: 'scraper_form',
        text: 'Select the check interval in minutes. The shorter the interval, the more CPU and resource usage.'
      });
      new HelpIcon({
        container: this.find('label[for=method]'),
        category: 'scraper_form',
        text: 'Select the request Method.'
      });
      new HelpIcon({
        container: this.find('label[for=url]'),
        category: 'scraper_form',
        text: 'The URL of the service to check, remember to encode it.',
        link: 'https://en.wikipedia.org/wiki/Percent-encoding'
      });
      new HelpIcon({
        container: this.find('label[for=tags]'),
        category: 'scraper_form',
        text: 'To help you find your resources quickly.'
      });
      new HelpIcon({
        container: this.find('label[for=body]'),
        category: 'scraper_form',
        text: 'Here can add body parameters to the request. Only available for POST and PUT methods. Default is GET'
      });
      new HelpIcon({
        container: this.find('label[for=timeout]'),
        category: 'scraper_form',
        text: 'How much time to wait the server\'s response before giving up. Default is 5 seconds.'
      });
      new HelpIcon({
        container: this.find('label[for=gzip]'),
        category: 'scraper_form',
        text: 'Enable HTTP compression to improve transfer speed and bandwidth utilization. An \'Accept-Encoding: gzip\' header will be added to the request. Default is true.',
        link: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Encoding'
      });
      new HelpIcon({
        container: this.find('label[for=json]'),
        category: 'scraper_form',
        text: 'Tells the server that the data being transferred is actually JSON. A \'Content-type: application/json\' header will be added to the request. Additionally, parses the response body as JSON. Default is false.',
        link: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type'
      });
      new HelpIcon({
        container: this.find('label[for=status_code]'),
        category: 'scraper_form',
        text: 'The expected status code that will be considered ok. Regular Expressions can be used to match a status, for example \'2[0-9][0-9]\' will match 2XX codes in the Success group. Default value is 200.',
        link: 'https://en.wikipedia.org/wiki/List_of_HTTP_status_codes'
      });
      new HelpIcon({
        container: this.find('label[for=pattern]'),
        category: 'scraper_form',
        text: 'A String or Regular Expression, also could be a part of the response, that will be considered ok.'
      });
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
      this.queryByHook('tags').select2({ placeholder: 'Tags', data: Select2Data.PrepareTags( this.tags ), tags: true });
      this.queryByHook('looptimes').select2({ placeholder: 'Monitor Looptime', data: Select2Data.PrepareIdValueData( this.looptimes ) });
      this.queryByHook('timeouts').select2({ placeholder: 'Request Timeout', data: Select2Data.PrepareIdValueData( this.timeouts ) });
      this.queryByHook('hosts').select2({ placeholder: 'Monitor Host', data: Select2Data.PrepareHosts( this.hosts ) });
      var usersSelect = this.usersSelect = new UsersSelect({ collection: this.users, autoRender: true });
      this.queryByHook('advanced').append( usersSelect.el );
    },
    remove : function(){
      this.$el.off('click');
      this.$el.off('change');
      this.usersSelect.remove();
      BaseView.prototype.remove.call(this);
    },
    focus : function(){
      this.find('input[name=description]').focus();
    },
    reset: function(){
      this.find('form')[0].reset();
    }
  });

  var TaskFormView = FormView.extend({
    render: function() {
      // parent render
      this.renderTemplate();

      // tasks doesn't has a loop
      this.find('[data-hook=looptime-container]').remove();

      var advancedSection = this.queryByHook('advanced');
      var triggerInputsHTML = Templates['assets/templates/trigger-inputs.hbs']();
      advancedSection.append( triggerInputsHTML );

      this.setupSelect();
      this.bindFormEvents();

      this.queryByHook('events-container').select2({
        placeholder: 'Events',
        data: Select2Data.PrepareEvents(this.events)
      });

      this.initHelp();
      this.setFormData(this.model);
    },
    initHelp: function() {
      FormView.prototype.initHelp.apply(this);

      new HelpIcon({
        container: this.find('label[for=triggers]'),
        category: 'scraper_form',
        text: 'Select a task, monitor or webhook event that will trigger this task automagically.'
      });

      new HelpIcon({
        container: this.find('label[for=grace_time]'),
        category: 'scraper_form',
        text: 'If you select to Trigger on an event, you can choose a delayed execution that allows you to cancel this action via email.'
      });
    }
  });

  return {
    FormView: FormView,
    TaskFormView: TaskFormView
  }

})();

//module.exports = Scraper;
