// Switch button
$(document).ready(function() {
	// global variable for visitor details
	// just checking if is touch device for now
	window.visitor = {};
	window.visitor.isTouch = is_touch_device();

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
	$('.panel-heading a').click(function(event ) {
		$('.panel-default').removeClass("panelActive");
		$( event.target ).closest( ".panel-default" ).toggleClass( "panelActive" );
	});

	// window resize handler
	var resizeMatters = function(){
		$('footer').css('position', $(document).height() <= $(window).height() ? 'fixed' : 'relative');
		$('body').css('padding-bottom', $('footer').css('position') == 'fixed' ? '80px' : '0');
	}
	$(window).on('resize', resizeMatters);
	resizeMatters();

	// tooltip initialization, only for non touch devices
	if(!visitor.isTouch) {
		$('.tooltiped').tooltip({container: 'tooltipHolder'});
	}
});
