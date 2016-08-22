var log = debug('eye:web:admin:search');

$(function(){

  $('button.resource-search').click(function(event){
    event.preventDefault();
    event.stopPropagation();

    var search = event.currentTarget.getAttribute('data-search');
    var $searchComponent = $('.js-searchable-box form');

    $searchComponent.find('input').val(search);
    $searchComponent.find('button.search').trigger('click');
  });

  (function(){
    var $searchItems = $('.js-searchable-box .js-searchable');
    var $searchFrom = $('.js-searchable-box form.search');
    var $searchBtn =  $searchFrom.find('button');
    var $searchInput = $searchFrom.find('input');

    $searchBtn.on("click", function(event){
      event.preventDefault();
      event.stopPropagation();

      log('searching...');
      var search = $searchInput.val().toLowerCase();
      var pattern = new RegExp(search);

      for(var i=0; i<$searchItems.length; i++){
        var $item = $( $searchItems[i] );
        var tags = $item.data('tags').toLowerCase();

        if( ! pattern.test(tags) ){
          if( $item.is(':visible') )
            $item.slideUp(200);
        }
        else {
          log('pattern matches on tags %s', tags);
          if( ! $item.is(':visible') )
            $item.slideDown(200);
        }
      }

    });
  })();

});
