/* global log */
(function ( $ ){
  $.searchbox = function(){
    var $emitter = $({});
    var lastTimer;

    var searchItemSelector = '.js-searchable-item';
    var $searchItems = $(searchItemSelector);
    var $searchBox = $('.js-searchable-box');
    var $searchBtn = $searchBox.find('button.search');
    var $searchCleanBtn = $searchBox.find('button.clean');
    var $searchInput = $searchBox.find('input');

    $searchInput.on('input', function(event){
      if( $searchInput.val() != '' ) {
        $searchCleanBtn.addClass('active');
        $emitter.trigger('search:start');
        $emitter.searching = true;
      } else {
        $searchCleanBtn.removeClass('active');
        $emitter.trigger('search:empty');
        $emitter.searching = false;
      }
    });

    $searchInput.on('keypress', function(event){
      if ( event.which == 13 ) { // Enter key = keycode 13
        $searchBtn.trigger('click');
        return false;
      }
    });

    $searchInput.on('keyup', function(event){
      var chars = $searchInput.val().length;
      if( chars >= 3 ) {
        $searchBtn.trigger('click');
      }
      else if( chars == 0 ) {
        $searchBtn.trigger('click');
      }
    });

    $searchCleanBtn.on('click', function(event){
      event.preventDefault();
      event.stopPropagation();
      log('clean search');

      lastTimer && clearTimeout(lastTimer);
      $searchInput.val('');
      $searchBtn.trigger('click');
    });

    $searchBtn.on('click', function(event){
      event.preventDefault();
      event.stopPropagation();

      lastTimer && clearTimeout(lastTimer);

      // early cut if no value to match
      if(!$searchInput.val()) {
        $searchInput.trigger('input');
        $searchItems.slideDown(200);
        return;
      }

      var waitForIt = false;
      log('searching');
      var search = $searchInput.val().toLowerCase();
      var pattern = new RegExp(search);

      for(var i=0; i<$searchItems.length; i++){
        var $item = $( $searchItems[i] );
        var tags = $item.data('tags').toLowerCase();

        if( ! pattern.test(tags) ){
          if( $item.is(':visible') ) {
            $item.slideUp(200);
            waitForIt = true;
          }
        }
        else {
          log('pattern matches on tags %s', tags);
          if( ! $item.is(':visible') ) {
            $item.slideDown(200);
            waitForIt = true;
          }
        }
      }
      // kludge!
      // if there's been any slide up/down, wait 10ms extra (200ms slide)
      // and trigger search:done
      if(waitForIt) {
        lastTimer = setTimeout(function(){
          $emitter.trigger({type:'search:done', matches:$(searchItemSelector+':visible').length});
        },210);
      }
    });

    $emitter.input = $searchInput;

    var existingSearch = window.getHashParams();
    if(existingSearch.search) {
      $searchInput.val(existingSearch.search);
      $searchBtn.trigger('click');
    }
    return $emitter;
  };
}( jQuery ));

window.$searchbox = $.searchbox();

var qs = window.location.href.split('#')[1];
var $input = $('.js-searchable-box input');
$input.val(qs);
$('.js-searchable-box button.search').click();
