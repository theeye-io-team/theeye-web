'use strict';

$(function(){

  var ANUAL_LICENSE_COST = 8000 ;

  function getServersAverage (events) {
    return parseInt(events) / 5 ;
  }

  function supportTotal (option) {
    // a year
    var costs = {
      '5 business day' : 0 ,
      '1 business day' : 600 ,
      '24/7' : 2400
    }
    return costs[option]||0;
  }

  function retentionTotal (option,agents) {
    var costs = {
      '1 week' : 1 * agents * 12,
      '1 month' : 2 * agents * 12,
      '6 months' : 2 * 6 * agents * 12,
      '1 year' : 2 * 12 * agents * 12,
      '3 years' : 2 * 36 * agents * 12,
      '0 none' : 0
    };
    return costs[option]||0;
  }

  function implementationTotal (option) {
    var costs = {
      'Self implementation': 0,
      'Remotely assisted' : 1000,
      'Consulting imp. remote training': 2000,
      'Consulting imp. training staff': 25000
    };
    return costs[option]||0;
  }

  function reportsTotal (option) {
    return 0;
  }

  function Calc ($el, options) {
    this.agentCost = isNaN(options.agentCost) ? 4 : options.agentCost;
    this.$el = $el;
    this.$form = this.$el.find('form');
    this.initialize(options);
    this.recalc();
  }

  /**
   * for each 5 events => +4usd
   */
  Calc.prototype.eventsCost = function (events) {
    events = parseInt(events);
    return (events/5) * this.agentCost;
  }

  Calc.prototype.recalc = function () {
    var form = new FormElement( this.$form );
    var selections = form.get();

    // calculated average servers/agents number based on amount of selected events.
    var servers = getServersAverage(selections['events']);

    var budget = 0;

    // per year
    for (var prop in selections) {
      switch (prop) {
        case 'license' :
          budget += ANUAL_LICENSE_COST ;
          break;
        case 'events' :
          budget += ( this.eventsCost(selections[prop]) - (this.eventsCost(5)) );// one server/5 events free
          break;
        case 'support' :
          budget += supportTotal(selections[prop]);
          break;
        case 'retention' :
          budget += retentionTotal(selections[prop], servers);
          break;
        case 'implementation' :
          budget += implementationTotal(selections[prop]);
          break;
        case 'reports' :
          budget += reportsTotal(selections[prop]);
          break;
        default: break;
      }
    }

    this.$form.find('[data-hook=total-anual]').html( budget );
  }

  Calc.prototype.initialize = function (options) {
    this.eventsSection(options.events);
    this.supportSection(options.support);
    this.retentionSection(options.retention);
    this.implementationSection(options.implementation);
    this.reportsSection(options.reports);
  }

  Calc.prototype.eventsSection = function (options) {
    var self = this;
    options = $.extend({},{
      min: 5,
      max: 500,
      step: 5,
      value: 5
    },options);

    var $section = this.$el.find('[data-hook=events]');
    var $slider = $section.find('.bootstrap-slider');
    $slider.slider(options);

    function setServersAverage (val) {
      $section
        .find("[data-hook=servers-average]")
        .text( getServersAverage(val) );
    }

    $slider.on("slide", function(slideEvt) {
      setServersAverage(slideEvt.value);
      self.recalc();
    });

    $slider.on("change", function(slideEvt) {
      setServersAverage(slideEvt.value.newValue);
      self.recalc();
    });

    setServersAverage( $slider.slider('getValue') );
  }

  Calc.prototype.supportSection = function(){
    var self = this;
    var $section = this.$el.find('[data-hook=support]');
    var $radio = $section.find('input[type=radio]');
    $radio.on('change',function(event){
      var val = $( event.target ).val();
      $section.find('span[data-hook=support-selected]').html( val );
      self.recalc();
    });
  }

  Calc.prototype.retentionSection = function(){
    var self = this;
    var $section = this.$el.find('[data-hook=retention]');
    var $radio = $section.find('input[type=radio]');
    $radio.on('change',function(event){
      var val = $( event.target ).val();
      $section.find('span[data-hook=retention-selected]').html( val );
      self.recalc();
    });
  }

  Calc.prototype.implementationSection = function(){
    var self = this;
    var $section = this.$el.find('[data-hook=implementation]');
    var $radio = $section.find('input[type=radio]');
    $radio.on('change',function(event){
      var val = $( event.target ).val();
      $section.find('span[data-hook=implementation-selected]').html( val );
      self.recalc();
    });
  }

  Calc.prototype.reportsSection = function(){
    var self = this;
    var $section = this.$el.find('[data-hook=reports]');
    var $radio = $section.find('input[type=radio]');
    $radio.on('change',function(event){
      var val = $( event.target ).val();
      $section.find('span[data-hook=reports-selected]').html( val );
      self.recalc();
    });
  }

  new Calc($('#devs'), { events:{ value: 3 * 5 } });
  new Calc($('#small'), { events:{ value: 10 * 5 } });
  new Calc($('#medium'), { events:{ value: 43 * 5 } });
  new Calc($('#saas'), {
    events:{
      value: 500 , // events
      min: 400,
      max: 4000
    }
  });

  new Calc($('#premise'), {
    agentCost: 0,
    events:{
      value: 500 * 5,
      min: 400,
      max: 4000
    }
  });

});
