$(function() {

  var $state = $({});

  function extractFormData ($el) {
      return $el.serializeArray().reduce(function(obj, input) {

        if(input.name=='customers')
        {
          if(!obj[input.name]) obj[input.name]=[];
          obj[input.name].push(input.value);
        }
        else if(input.name === 'enabled')
        {
          obj[input.name] = $("[name=enabled]").prop("checked");
        }
        else
        {
          obj[input.name] = input.value;
        }
        return obj;

      }, {});
    }

  //CREATE USER FORM
  (function create(el){

    var $userForm = $(el);

    $(".modal#create-user").on('shown.bs.modal', function(event) {
      $userForm.find(".hidden-container").hide();
      $userForm.data('action','create');
      $userForm[0].reset();
      $('#name',this).focus();
      $('#customers',$userForm).select2({placeholder: 'Select customers...'});
    });

    $state.on("user_created", function() {
      $(".modal#create-user").modal("hide");
      alert('user created','User', function(){
        window.location.reload();
      });
    });

    $state.on("user_create_error", function(ev, error) {
      alert(error);
    });

    // what is this shit?
    // $userForm.find("input[type=radio][name=target]").on("change", function(){
    //   var val = $(this).val();
    //   var $multihost = $userForm.find('.hidden-container#hosts-selection');
    //   var $singleresource = $userForm.find('.hidden-container#resource-selection');
    //   if( val == 'single-resource' ) {
    //     $multihost.hide(50);
    //     $multihost.find("option:selected").removeAttr("selected");
    //     $singleresource.show(50);
    //   } else if( val == 'multi-hosts' ){
    //     $singleresource.hide(50);
    //     $singleresource.find("select").val(0);
    //     $multihost.show(50);
    //   }
    // });

    $userForm.on("submit", function(event) {
      event.preventDefault();
      var vals = extractFormData($userForm);

      jQuery.post("/user", vals).done(function(data) {
        $state.trigger("user_created");
      }).fail(function(xhr, err, xhrStatus) {
        $state.trigger("user_create_error", xhr.responseText, err);
      });

      return false;
    });

  })("form#createUserForm");

  //EDIT USER FORM
  (function update (el){

    var $userForm = $(el);

    function fillForm($viewElement, data) {
      $viewElement[0].reset();
      Object.keys(data).forEach(function(k) {
        if(k === 'customers') {
          var customers = data[k];
          customers.forEach(function(customer) {
            $('option[value="'+customer+'"]', $('#customers-edit')).prop('selected', true);
          });
        }

        if(k === 'enabled' && data[k]) {
          $("#enabled").prop("checked", true);
        }

        var $el = $viewElement.find("[data-hook="+ k + "]");
        $el.val(data[k]);
      });
    }

    $(".modal#edit-user").on('shown.bs.modal', function(event) {
      //nice-guy first input auto focus
      $('#name',this).focus();
      $('#customers-edit', this).select2();
    });

    $('button.editUser').on('click', function(evt){
      evt.stopPropagation();
      evt.preventDefault();
      var item = $(this).closest('.itemRow');
      $userForm.data('user-id',item.data().itemId);
      $userForm.data('action','edit');
      $.get("/user/" + item.data().itemId).done(function(data){
        fillForm($userForm, data.user);
        $('#edit-user').modal('show');
      }).fail(function(xhr, err, xhrStatus) {
        $state.trigger("user_fetch_error", xhr.responseText, err);
      });
    });

    $state.on("user_updated",function() {
      $(".modal#edit-user").modal("hide");
      window.location.reload();
    });

    $state.on("user_update_error",function(error) {
      alert(error);
    });

    $userForm.on("submit", function(event) {
      event.preventDefault();
      var vals = extractFormData($userForm);

      jQuery.ajax({
        url:"/user/" + $userForm.data('user-id'),
        data:vals,
        type:'put'
      }).done(function(data) {
        $state.trigger("user_updated");
      }).fail(function(xhr, err, xhrStatus) {
        $state.trigger("user_update_error", xhr.responseText, err);
      });

      return false;
    });

    return $userForm;
  })("form#editUserForm");

  (function remove(){
    $state.on("user_deleted", function(ev,$el) {
      //$el.remove();
      location.reload();
    });
    $state.on("user_delete_error", function(ev, resp, err) {
      alert(resp);
    });

    $(".deleteUser").on("click",function(ev){
      ev.preventDefault();
      ev.stopPropagation();

      bootbox.confirm('The resource will be removed. Want to continue?',
      function(confirmed)
      {
        if(!confirmed)
          return;

        var $delTrigger = $(ev.currentTarget);
        var idUser = $delTrigger.data("user-id");

        $.ajax({
          url: '/user/' + idUser,
          type: 'DELETE'
        }).done(function(data) {
          $state.trigger("user_deleted", $delTrigger.closest('tr')[0]);
        }).fail(function(xhr, err, xhrStatus) {
          $state.trigger("user_delete_error", xhr.responseText, err);
        });
      });
    });
  })();

  (function reSendInvitation() {
    $state.on("invitation_sent", function(ev,$el) {
      alert("Invitation sent");
    });

    $state.on("invitation_error", function(ev, resp, err) {
      alert("Error sending the invitation");
    });

    $(".reSendInvitation").on("click",function(ev){
      var $delTrigger = $(ev.currentTarget);
      var idUser = $delTrigger.data("user-id");

      $.ajax({
        url: '/user/' + idUser + '/reinvite',
        type: 'PUT'
      }).done(function(data) {
        $state.trigger("invitation_sent", $delTrigger.closest('tr')[0]);
      }).fail(function(xhr, err, xhrStatus) {
        $state.trigger("invitation_error", xhr.responseText, err);
      });
    });
  })();

  (function toogleSendInvitation() {
    $("[data-hook=sendInvitation]").change(function(e)
    {
      if( $("[data-hook=sendInvitation]").prop("checked") === true)
        $(".set-password").hide();
      else
        $(".set-password").show();
    });
  })();
});
