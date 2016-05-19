// Switch button
$(document).ready(function() {
  // global variable for visitor details
  // just checking if is touch device for now
  window.visitor = {};
  window.visitor.isTouch = window.is_touch_device();

  $('.switch').click(function() {
    $(this).toggleClass("switchOn");
  });
  $( ".forgotLink" ).click(function() {
    $('.signIn').slideUp('slow');
    $('.forgotForm').slideDown('slow');
  });
  $( ".cancelLink" ).click(function() {
    $('.forgotForm').slideUp('slow');
    $('.signIn').slideDown('slow');
  });

  $('.panel-collapse').on('shown.bs.collapse', function(evt){
    $( this ).closest( ".panel-default" ).addClass( "panelActive" );
    // console.log('shown');
  });
  $('.panel-collapse').on('hidden.bs.collapse', function(evt){
    $( this ).closest( ".panel-default" ).removeClass("panelActive");
    // console.log('hidden');
  });

  // window resize handler
  var resizeMatters = function(){
    $('footer').css('position', $(document).height() <= $(window).height() ? 'fixed' : 'relative');
    $('body').css('padding-bottom', $('footer').css('position') == 'fixed' ? '80px' : '0');
  };
  $(window).on('resize', resizeMatters);
  resizeMatters();

  // tooltip initialization, only for non touch devices
  if(!window.visitor.isTouch) {
    $('.tooltiped').tooltip({container: 'tooltipHolder'});
  }
});
