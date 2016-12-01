$(function(){


  function Calc ($el) {

    this.$el = $el;

    this.initialize();

  }

  Calc.prototype.initialize = function () {
    this.eventsSection();
  }

  Calc.prototype.eventsSection = function () {
    var $el = this.$el;

    var $slider = $el.find(".bootstrap-slider");
    $slider.slider();
    $slider.on("slide", function(slideEvt) {
      $el.find("[data-hook=servers-average]")
        .text(slideEvt.value);
    });

    $slider.on("change", function(slideEvt) {
      $el.find("[data-hook=servers-average]")
        .text(slideEvt.value.newValue);
    });
  }

  new Calc( $('#devs') );
  new Calc( $('#small') );
  new Calc( $('#medium') );
  new Calc( $('#saas') );
  new Calc( $('#premise') );


});
