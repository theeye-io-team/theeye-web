var LoginPageInit = (function() {

  // add class to body
  $('body').addClass('login');
  
  $(".retrivePassword").on("click",function(e){
    e.preventDefault();
    e.stopPropagation();

    var email = $("[name=email]").val();

    $.ajax({
      url: '/password/resetmail',
      type: 'POST',
      data: { email: email }
    }).done(function(data) {
      bootbox.alert("Password restore link sent");
    }).fail( xhrError );
  });

});
