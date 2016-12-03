$(document).ready(function() {

  "use strict";
  /***************************************************************************/
  /* PARALLAX */
  /***************************************************************************/
  $(window).stellar({
    horizontalScrolling: false
  });



  /***************************************************************************/
  /* CUSTOMIZABLE SCROLLBAR */
  /***************************************************************************/
  $("html").niceScroll({
    mousescrollstep: 40,
    cursorcolor: "#1abc9c",
    zindex: 9999,
    cursorborder: "none",
    cursorwidth: "6px",
    cursorborderradius: "none"
  });



  /***************************************************************************/
  /* NAVIGATION SCROLL */
  /***************************************************************************/
  $('.main-navigation').onePageNav({
    scrollThreshold: 0.2, // Adjust if Navigation highlights too early or too late
    scrollSpeed: 1000,
    scrollOffset: 60 //Height of Navigation Bar
  });


  /* DOWNLOAD AND LEARN MORE BUTTON SCROLL FROM HOME PAGE */
  $('.home-btn').localScroll({
    offset: -60 //Height of Navigation Bar
  });



  /***************************************************************************/
  /* CONTACT SECTION EXPEND FROM NAVBAR CONTACT MENU */
  /***************************************************************************/
  $(".opencontact").click(function() {
    $('#section10').collapse('show');
  });



  /***************************************************************************/
  /* SMOOTH SCROLL / CURRENTLY ENABLED IN niceScroll */
  /***************************************************************************/

  /*

var scrollAnimationTime = 1200,
    scrollAnimation = 'easeInOutExpo';

$('a.scrollto').bind('click.smoothscroll', function (event) {
    event.preventDefault();
    var target = this.hash;

    $('html, body').stop().animate({
        'scrollTop': $(target).offset().top
    }, scrollAnimationTime, scrollAnimation, function () {
        window.location.hash = target;
    });
});

*/



  /***************************************************************************/
  /* VIDEO BACKGROUND */
  /***************************************************************************/
//Facu esto y lo de mailchimp va?  if(matchMedia('(min-width: 640px)').matches) {
//    var videobackground = new $.backgroundVideo($('body'), {
//      "align": "centerXY",
//      "width": 1280,
//      "height": 720,
//      "path": "video/",
//      "filename": "video",
//      "types": ["mp4","ogv","webm"]
//    });
//  }



  /***************************************************************************/
  /* MAILCHIMP NEWSLETTER SUBSCRIPTION */
  /***************************************************************************/
  $(".mailchimp-subscribe").ajaxChimp({
    callback: mailchimpCallback,
    url: "http://bdpark.us7.list-manage1.com/subscribe/post?u=d6649e6cfae99f3bc710a85a5&id=07db0b4bd6" // Replace your mailchimp post url inside double quote "".
  });

  function mailchimpCallback(resp) {
    if(resp.result === 'success') {
      $('.subscription-success')
        .html('<i class="icon_check_alt2"></i>' + resp.msg)
        .delay(500)
        .fadeIn(1000);

      $('.subscription-failed').fadeOut(500);

    } else if(resp.result === 'error') {
      $('.subscription-failed')
        .html('<i class="icon_close_alt2"></i>' + resp.msg)
        .delay(500)
        .fadeIn(1000);

      $('.subscription-success').fadeOut(500);
    }
  };



  // Function for email address validation
  function isValidEmail(emailAddress) {

    var pattern = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);

    return pattern.test(emailAddress);

  };



  /***************************************************************************/
  /* LOCAL NEWSLETTER SUBSCRIPTION */
  /***************************************************************************/
  $("#local-subscribe").submit(function(e) {
    e.preventDefault();
    var data = {
      email: $("#subscriber-email").val()
    };

    if ( isValidEmail(data['email']) ) {
      $.ajax({
        type: "POST",
        url: "subscribe/subscribe.php",
        data: data,
        success: function() {
          $('.subscription-success').fadeIn(1000);
          $('.subscription-failed').fadeOut(500);
        }
      });
    } else {
      $('.subscription-failed').fadeIn(1000);
      $('.subscription-success').fadeOut(500);
    }

    return false;
  });



  /***************************************************************************/
  /* CONTACT FORM */
  /***************************************************************************/
  $("#contact").submit(function(e) {
    e.preventDefault();
    var data = {
      name: $("#name").val(),
      email: $("#email").val(),
      message: $("#message").val()
    };

    if ( isValidEmail(data['email']) && (data['message'].length > 1) && (data['name'].length > 1) ) {
      $.ajax({
        type: "POST",
        url: "sendmail.php",
        data: data,
        success: function() {
          $('.email-success').delay(500).fadeIn(1000);
          $('.email-failed').fadeOut(500);
        }
      });
    } else {
      $('.email-failed').delay(500).fadeIn(1000);
      $('.email-success').fadeOut(500);
    }

    return false;
  });



  /***************************************************************************/
  /* WOW ANIMATION */
  /***************************************************************************/
  var wow = new WOW({ mobile: false });

  wow.init();



  /***************************************************************************/
  /* SCREENSHOT SLIDER */
  /***************************************************************************/

  var screenshots2 = $("#owl-allsimple");

  screenshots2.owlCarousel({
    items : 1,
    autoPlay:true,
    addClassActive:true,
    stopOnHover:true
  });


  function assignItemClass() {
    $(".step01").removeClass("active");
    $(".step02").removeClass("active");
    $(".step03").removeClass("active");
    $(".step04").removeClass("active");

    if ($(".item1").parent("div").hasClass("active")) {
      $(".step01").addClass("active")
    };
    if ($(".item2").parent("div").hasClass("active")) {
      $(".step02").addClass("active")
    };
    if ($(".item3").parent("div").hasClass("active")) {
      $(".step03").addClass("active")
    };
    if ($(".item4").parent("div").hasClass("active")) {
      $(".step04").addClass("active")
    };
  };

  window.setInterval(assignItemClass, 1000);



  var screenshots = $("#owl-screenshots");

  screenshots.owlCarousel({
    items : 3, // 4 items above 1201px browser width
    itemsDesktop : [1200,3], // 4 items between 1200px and 993px
    itemsDesktopSmall : [992,3], // 3 items betweem 992px and 769px
    itemsTablet: [768,3], // 3 items between 768 and 601
    itemsTabletSmall : [480,2], // 2 items in widen mobile device
    itemsMobile : [320,1], // 1 items in any small mobile device
    autoPlay:true,
    addClassActive:true
  });



  /***************************************************************************/
  /* TESTIMONIAL SYNC WITH CLIENTS */
  /***************************************************************************/
  var sync1 = $("#sync1"); // client's message
  var sync2 = $("#sync2"); // client's avatar

  sync1.owlCarousel({
    singleItem : true,
    slideSpeed : 1000,
    navigation: false,
    pagination:false,
    afterAction : syncPosition,
    responsiveRefreshRate : 200,
    autoPlay: 5000
  });


  sync2.owlCarousel({
    items : 3,        //# clients image will displace in single display
    itemsDesktop      : [1200,3],
    itemsDesktopSmall     : [992,3],
    itemsTablet       : [768,2],
    itemsTabletSmall       : [480,2],
    itemsMobile       : [320,1],
    pagination:false,
    responsiveRefreshRate : 100,
    afterInit : function(el){
      el.find(".owl-item").eq(0).addClass("synced");
    }
  });

  function syncPosition(el){
    var current = this.currentItem;
    $("#sync2")
      .find(".owl-item")
      .removeClass("synced")
      .eq(current)
      .addClass("synced")
    if($("#sync2").data("owlCarousel") !== undefined){
      center(current)
    }
  }

  $("#sync2").on("click", ".owl-item", function(e){
    e.preventDefault();
    var number = $(this).data("owlItem");
    sync1.trigger("owl.goTo",number);
  });

  function center(number){
    var sync2visible = sync2.data("owlCarousel").owl.visibleItems;
    var num = number;
    var found = false;
    for(var i in sync2visible){
      if(num === sync2visible[i]){
        var found = true;
      }
    }

    if(found===false){
      if(num>sync2visible[sync2visible.length-1]){
        sync2.trigger("owl.goTo", num - sync2visible.length+2)
      }else{
        if(num - 1 === -1){
          num = 0;
        }
        sync2.trigger("owl.goTo", num);
      }
    } else if(num === sync2visible[sync2visible.length-1]){
      sync2.trigger("owl.goTo", sync2visible[1])
    } else if(num === sync2visible[0]){
      sync2.trigger("owl.goTo", num-1)
    }
  }



  /***************************************************************************/
  /* OUR OTHER APPS */
  /***************************************************************************/
  $("#our-other-apps").owlCarousel({

    navigation : false, // Show next and prev buttons
    slideSpeed : 300,
    paginationSpeed : 400,
    singleItem:true

  });

});


/* =================================
===  Bootstrap Internet Explorer 10 in Windows 8 and Windows Phone 8 FIX
=================================== */
if (navigator.userAgent.match(/IEMobile\/10\.0/)) {
  var msViewportStyle = document.createElement('style')
  msViewportStyle.appendChild(
    document.createTextNode(
      '@-ms-viewport{width:auto!important}'
    )
  )
  document.querySelector('head').appendChild(msViewportStyle)
}


/***************************************************************************/
/* FULLSCREEN HOME SECTION */
/***************************************************************************/
var fullscreen_home = function(){
  if(matchMedia( "(min-width: 768px) and (min-height: 500px)" ).matches) {
      var height = $(window).height() + "px";
      $(".header").css('min-height', height);
  }
}

$(document).ready(fullscreen_home);
$(window).resize(fullscreen_home);


/***************************************************************************/
/* SUPPORT */
/***************************************************************************/


function toggleChevron(e) {
    $(e.target)
        .prev('.panel-heading')
        .find("i.indicator")
        .toggleClass('glyphicon-chevron-up glyphicon-chevron-down');
}
$('#accordion').on('hidden.bs.collapse', toggleChevron);
$('#accordion').on('shown.bs.collapse', toggleChevron);
$('#accordion2').on('hidden.bs.collapse', toggleChevron);
$('#accordion2').on('shown.bs.collapse', toggleChevron);

/* responsive tabs */

  (function($) {
      fakewaffle.responsiveTabs(['xs', 'sm']);
  })(jQuery);
  
  
  
/* general tooltip init */

$(function () {
  $('[data-toggle="tooltip"]').tooltip()
})

/* Collapse Calculator if Its mobile
 */
$(window).on("load resize",function(e){
	if ($(window).width() < 992) {
		$( "#collapse-devs" ).removeClass( "in" )
	}
});
