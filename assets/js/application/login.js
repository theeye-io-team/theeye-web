$(function()
{
  var $state = $({});

  // add class to body
  $('body').addClass('login');
  
  //**Retrieve password**//
  (function retrivePassword()
  {
    $state.on("retrive_password_sent", function(ev) {
      alert("Password restore link sent");
    });

    $state.on("retrive_password_error", function(ev, resp, err) {
      alert("Error sending the restore password link");
    });

    $(".retrivePassword").on("click",function(e){
      e.preventDefault();
      e.stopPropagation();

      var email = $("[name=email]").val();

      $.ajax({
        url: '/user/resetpass',
        type: 'PUT',
        data: {email : email}
      }).done(function(data) {
        $state.trigger("retrive_password_sent");
      }).fail(function(xhr, err, xhrStatus) {
        $state.trigger("retrive_password_error", xhr.responseText, err);
      });
    });
  })();

});
