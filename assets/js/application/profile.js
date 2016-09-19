$('document').ready(function(){

  new Clipboard('.clipboard-btn');
  new Clipboard('.clipboard-token-btn');
  new Clipboard('.clipboard-agent-token-btn');

  $('[data-hook=blurry]').on('click',function(event){
    $( this ).toggleClass('blurry-text');
  });

  $('[data-hook=blurry]').addClass('cursor-pointer blurry-text');
  $('[data-hook=blurry]').removeClass('hidden');

});
