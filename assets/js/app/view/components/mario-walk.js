/**
 *
 * @author Facugon
 *
 */

//var jquery = require('jquery');


var MarioWalk = function (options) {

  options||(options={});

  var $mario_small = $('<div style="position:fixed;bottom:0px;left:-100px;z-index:1000;"><img src=/mario/mario_small.gif></div>');
  var $mario_big = $('<div style="position:fixed;bottom:0px;left:-100px;z-index:1000;"><img width="100px" src=/mario/mario_big.gif></div>');
  var $yoshi = $('<div style="position:fixed;bottom:0px;left:-100px;z-index:1000;"><img width="100px" src=/mario/yoshi_color.gif></div>');
  var $mario_yoshi = $('<div style="position:fixed;bottom:0px;left:-150px;z-index:1000;"><img width="150px" src=/mario/mario_yoshi.gif></div>');

  $mario_small.appendTo(document.body);
  $mario_big.appendTo(document.body);
  $yoshi.appendTo(document.body);
  $mario_yoshi.appendTo(document.body);

  if (options.full===true) {
    var $audio = $('<audio src="/mario/theme.mp3" preload="auto"></audio>');
  } else {
    var $audio = $('<audio src="/mario/short.mp3" preload="auto"></audio>');
  }
  $audio[0].play();

  function animate ($el,next) {
    $el.animate({
      left: $(window).width() 
    },3600,'swing',function complete(){
    });
    
    setTimeout(next,500);
  }

  animate($mario_small,function(){
    animate($mario_big,function(){
      animate($yoshi,function(){
        animate($mario_yoshi,function(){
        });
      });
    });
  });

  return this;
}

