/**
 *
 * @author Facugon
 *
 */

//var jquery = require('jquery');


var MarioWalk = function (options) {

  options||(options={});

  var $template = $('<div style="position:fixed;bottom:0px;left:-100px;z-index:1000;"><img src=/mario/running.gif></div>');

  $template.appendTo(document.body);

  if (options.full===true) {
    var $audio = $('<audio src="/mario/theme.mp3" preload="auto"></audio>');
  } else {
    var $audio = $('<audio src="/mario/short.mp3" preload="auto"></audio>');
  }
  $audio[0].play();

  $template.animate({
    left: $(window).width() 
  },3600,'swing',function complete(){
    /* on complete */ 
  });

  return this;
}

