var InvitePageInit = (function() {

  $('#inviteForm').on('submit', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var email = $("[name=email]").val();
      var customer = $("[name=customer]").val();
      var credential = $("[name=credential]").val();

      $.ajax({
        url: '/auth/inviteuser',
        type: 'POST',
        data: { email: email, customer: customer, credential: credential }
      }).done(function(result) {
        bootbox.alert("Invitation email sent.", function(){
          window.location = "/dashboard";
        });
      }).fail( function(xhrError){
        bootbox.alert("Error sending invitation email.");
      });
  });
});
