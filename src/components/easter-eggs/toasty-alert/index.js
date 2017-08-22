/**
 *
 * @author Facugon
 *
 */
var jquery = require('jquery');

const ToastyAlert = function (options) {

  var $template = $('<div style="position:fixed;bottom:0px;right:-200px;z-index:1000;"><img src=/toasty/avatar_1.png></div>');

  $template.appendTo(document.body);

  var $audio = $('<audio src="/toasty/avatar_1.mp3" preload="auto"></audio>');

  $template.animate({ right:'0px' },200,'swing',function complete(){
    /* on complete */ 
  });
  $audio[0].play();

  setTimeout(function(){
    $template.animate({ right:'-200px' },200,'swing',function complete(){
      $template.remove();
      $audio.remove();
    });
  },1000);

  return this;
}

module.exports = ToastyAlert
