var AuthPageInit = (function() {
  var $state = $({});

  $state.on("password_changed",function(){
    alert("Password updated", "Change password", function(){
        $('.modal#changePass').modal("hide");
    });
  });
  
  $state.on("password_change_error",function(event,error) {
    alert(error);
  });

  var submit = function($el) {
    $el.on("submit",function(event) {
      event.preventDefault();
      var vals = $el.serializeArray()
        .reduce(function(obj, input) {
          obj[input.name] = input.value;
          return obj;
        }, {});

      $.post("/auth/local/update", vals)
        .done(function(data) {
          $state.trigger("password_changed");
        })
        .fail(function(xhr, xhrStatus, err) {
          $state.trigger(
            "password_change_error", [ xhr.responseText, err, xhrStatus ]);
        });
    });
  };

  submit( $('form#changePass') );
});
