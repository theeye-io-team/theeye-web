/* global Clipboard */
$('document').ready(function(){

  new Clipboard('.clipboard-btn');
  new Clipboard('.clipboard-token-btn');
  new Clipboard('.clipboard-agent-token-btn');
  new Clipboard('.clipboard-client-secret-btn');
  new Clipboard('.clipboard-client-id-btn');
  new Clipboard('.clipboard-customer-name-btn');

  $('[data-hook=blurry]').on('click',function(event){
    $( this ).toggleClass('blurry-text');
  });

  $('[data-hook=blurry]').addClass('cursor-pointer blurry-text');
  $('[data-hook=blurry]').removeClass('hidden');

});
