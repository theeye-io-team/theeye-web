/* =================================
   LOADER                     
=================================== */
// makes sure the whole site is loaded
$(window).load(function() {
    // will first fade out the loading animation
    $(".loader").fadeOut();
    //then background color will fade out slowly
    $(".spinner-wrapper").delay(200).fadeOut("slow");
});