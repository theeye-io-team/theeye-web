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
      var search = $searchInput.val('');
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
        return
      };

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


    // affix for searchbox
    $searchBox.affix({offset: {top: 10 } });
    // $searchBox.width(function(){
    //   $searchBox.width($searchBox.parent().width());
    // });

    // check the size of the searchbox on orientationchange
    $(window).on('orientationchange', function(){
      if($searchBox.hasClass('affix-top')) {
        // it it's at its topmost position
        // reassure a 100%
        $searchBox.width('100%');
      }else{
        // added a timeout here. The parent didn't get
        // the memo on time on my moto G
        setTimeout(function(){
          $searchBox.width($searchBox.parent().width());
        }, 250);
      }
    });


    $searchBox.on('affix.bs.affix', function(){
      var $this = $searchBox;
      $this.width($this.parent().width());
      var top = parseInt($this.parent().css('padding-top'));
      $this.data('parentPaddingTop', top);
      $this.parent().css('padding-top', (top + $this.outerHeight(true)) + 'px');
    });
    $searchBox.on('affixed-top.bs.affix', function(){
      $searchBox.width('100%');
      if($searchBox.data('parentPaddingTop')) {
        $searchBox.parent().css('padding-top', $searchBox.data('parentPaddingTop'));
      }
    });

    return $emitter;
  }
}( jQuery ));

$searchbox = $.searchbox();
