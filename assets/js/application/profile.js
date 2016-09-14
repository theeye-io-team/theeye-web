$('document').ready(function(){

  new Clipboard('.clipboard-btn');

  $('[data-hook=blurry]').on('click',function(event){
    $( this ).toggleClass('blurry-text');
  });

  $('[data-hook=blurry]').addClass('cursor-pointer blurry-text');

});
