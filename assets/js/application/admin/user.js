/* global bootbox, $searchbox, console */
$(function() {

  var $state = $({});

  function extractFormData ($el) {
    return $el.serializeArray().reduce(function(obj, input) {

      if(input.name=='customers') {
        if(!obj[input.name]) obj[input.name]=[];
        obj[input.name].push(input.value);
      } else if(input.name === 'enabled') {
        obj[input.name] = $('[name=enabled]').prop('checked');
      } else {
        obj[input.name] = input.value;
      }
      return obj;

    }, {});
  }

  //CREATE USER FORM
  (function create(el){

    var $userForm = $(el);

    $(".modal#create-user").on('shown.bs.modal', function() {
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
      alert(error,'Oops...');
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
        console.log(data);
        $state.trigger("user_created");
      }).fail(function(xhr, status, xhrStatus) {
        $state.trigger("user_create_error", xhr.responseText, status);
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

    $(".modal#edit-user").on('shown.bs.modal', function() {
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
      }).fail(function(xhr, err/*, xhrStatus*/) {
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
      }).done(function(/*data*/) {
        $state.trigger("user_updated");
      }).fail(function(xhr, err/*, xhrStatus*/) {
        $state.trigger("user_update_error", xhr.responseText, err);
      });

      return false;
    });

    return $userForm;
  })("form#editUserForm");

  (function remove(){
    $state.on("user_deleted", function() {
      //$el.remove();
      location.reload();
    });
    $state.on("user_delete_error", function(ev, resp) {
      alert(resp);
    });

    $(".deleteUser").on("click",function(ev){
      ev.preventDefault();
      ev.stopPropagation();

      bootbox.confirm('The resource will be removed. Want to continue?',
      function(confirmed) {
        if(!confirmed)
          return;

        var $delTrigger = $(ev.currentTarget);
        var idUser = $delTrigger.data("user-id");

        $.ajax({
          url: '/user/' + idUser,
          type: 'DELETE'
        }).done(function(/*data*/) {
          $state.trigger("user_deleted", $delTrigger.closest('tr')[0]);
        }).fail(function(xhr, err) {
          $state.trigger("user_delete_error", xhr.responseText, err);
        });
      });
    });
  })();

  (function reSendInvitation() {
    $(".reSendInvitation").on("click",function(ev){
      ev.stopPropagation();
      ev.preventDefault();
      var $delTrigger = $(ev.currentTarget);
      var idUser = $delTrigger.data("user-id");

      $.ajax({
        url: '/user/' + idUser + '/reinvite',
        type: 'PUT'
      }).done(function() {
        alert("Invitation sent","Done!");
      }).fail(function(xhr, err) {
        alert("Error sending the invitation. " + xhr.responseText, "Oops...");
      });
    });
  })();

  (function toogleSendInvitation() {
    $("[data-hook=sendInvitation]").change(function()
    {
      if( $("[data-hook=sendInvitation]").prop("checked") === true)
        $(".set-password").hide();
      else
        $(".set-password").show();
    });
  })();

  // MASS DELETE
  (function massDelete(){
    // searchbox hook
    $searchbox.on('search:start', function() {
      $('.massChecker').trigger('uncheck');
    });
    $searchbox.on('search:empty', function() {
      $('.massChecker').trigger('uncheck');
    });

    // SETUP
    var firstConfirmHeader = '<h1>Massive user delete</h1>Heads up!<br /><br />';
    var firstConfirmFooter = '<br />will be deleted.<h2>Are you sure?</h2>';
    var secondConfirmHeader = '<h1>Hey mister!</h1>' +
      'Those are users you are deleting, are you completely sure?<br /><br />';
    var secondConfirmFooter = '<br />WILL BE DELETED<h2>Confirm wisely</h2>';
    var successTitle = 'Users deleted';
    var successFooter = '<br/>...you will be missed :(';
    var failTitle = 'Users deleted (some)';
    var failFooter = '<br/>...I tried to delete these users' +
      ' yet some of them came back with errors.' +
      '<br /><br />Please refresh now';
    var dataId = "itemId"; // the data-something where we get the id of the item
    var dataDescriptor = "itemName"; // the data-something where we get the name of the item
    var listTemplate = "{descriptor} ({id})<br />";
    var itemSelector = 'div.itemRow.selectedItem:visible';
    var apiUrlEndpoint = '/user/';
    var apiRequestType = 'DELETE';

    // MASS DELETE - OJO
    $('.massDelete').on('click', function(evt){
      evt.preventDefault();
      var taskRows = "";
      var taskIds = [];
      //collect selected rows.data (dataId & dataDescriptor)
      $(itemSelector).each(function(i,e){
        var itemId = $(e).data(dataId);
        var itemName = $(e).data(dataDescriptor);
        if(itemId) {
          taskIds.push(itemId);
          var listItem = listTemplate
            .replace("{id}", itemId)
            .replace("{descriptor}", itemName);
          //concatenate notification rows
          taskRows = taskRows + listItem;
        }
      });
      if(taskRows) {
        bootbox.confirm(firstConfirmHeader + taskRows + firstConfirmFooter, function(result1){
          if(!result1) {
            return;
          }
          bootbox.confirm(secondConfirmHeader + taskRows + secondConfirmFooter, function(result2){
            if(!result2) {
              return;
            }
            $.blockUI();
            var deleteRequests = [];
            var removeOnSuccess = function(id) {
              console.log('request success');
              $('div.itemRow[data-item-id='+id+']').remove();
            };
            for(var ii = 0; ii < taskIds.length; ii++) {
              var t = taskIds[ii];
              deleteRequests.push(
                $.ajax({
                  url: apiUrlEndpoint + t,
                  type: apiRequestType,
                  // on success remove div[data-item-id=itemId]
                  success: (function(aa){
                    return removeOnSuccess(aa);
                  })(t)
                })
              );
            }

            $.when.apply($, deleteRequests).then(
              function(){
                console.log('then success');
                console.log(arguments);
                alert(taskRows + successFooter, successTitle);
              },
              function(){
                console.log('then fail');
                console.log(arguments);
                alert(taskRows + failFooter, failTitle);
              },
              // then progress nunca se llama ... ?
              function() {
                console.log('then progress');
                console.log(arguments);
              }
            // when progress nunca se llama tampoco ... ?
            ).progress(function(){
              console.log('when progress');
              console.log(arguments);
            }
            ).always(function(){
              console.log('always');
              console.log(arguments);
              $.unblockUI();
            }
            ).done(function(){
              // done deberia volver con array de results
              // no se si no funciona o es porque el req.DELETE
              // no devuelve nada, habria que probar de cambiar la API
              console.log('when done');
              console.log(arguments);
              console.log('ok, they are gone');
            });
          });
        });
      }
      $(this).blur();
      return false;
    });

    // MASS CHECKER
    $('.massChecker').on('click', function(evt){
      var $this = $(this);
      evt.stopPropagation();
      var $spanIcon = $this.children('span').first();
      if($this.data('checked')) {
        //uncheck all by firing event
        $this.trigger('uncheck');
      }else{
        // do an "uncheck all", there maybe some left from a prior search
        // this should be hooked on the search event
        $('.rowSelector').trigger('uncheck');
        $('.rowSelector:visible').trigger('check');
        $this.data('checked',true);
        $spanIcon.addClass('glyphicon-check');
        $spanIcon.removeClass('glyphicon-unchecked');
      }
      $(this).blur();
    });
    $('.massChecker').on('uncheck', function(){
      var $this = $(this);
      var $spanIcon = $this.children('span').first();
      $this.data('checked',false);
      $spanIcon.removeClass('glyphicon-check');
      $spanIcon.addClass('glyphicon-unchecked');
      $('.rowSelector').trigger('uncheck');
    });

    // MASS CHECKER: when an item changes state it triggers
    // a itemchanged event on massChecker. On itemchanged MASS CHECKER
    // checks for an unchecked item. If any, MASS CHECKER unchecks itself
    $('.massChecker').on('itemchanged', function(){
      console.log('checking items state');
      var $this = $(this);
      var $spanIcon = $this.children('span').first();
      $('.rowSelector:visible').each(function(i,e){
        if(!$(e).data('checked')) {
          $this.data('checked', false);
          $spanIcon.removeClass('glyphicon-check');
          $spanIcon.addClass('glyphicon-unchecked');
          return;
        }
      });
    });

    // ROW SELECTOR
    $('.rowSelector').on('check', function(){
      var $this = $(this);
      var $spanIcon = $this.children('span').first();
      $this.data('checked',true);
      $spanIcon.addClass('glyphicon-check');
      $spanIcon.removeClass('glyphicon-unchecked');
      $this.closest('.itemRow').addClass('selectedItem');
    });
    $('.rowSelector').on('uncheck', function(){
      var $this = $(this);
      var $spanIcon = $this.children('span').first();
      $this.data('checked',false);
      $spanIcon.removeClass('glyphicon-check');
      $spanIcon.addClass('glyphicon-unchecked');
      $this.closest('.itemRow').removeClass('selectedItem');
    });

    // ROW SELECTOR on click only determine if checked or not and fire event
    $('.rowSelector').on('click', function(evt){
      var $this = $(this);
      evt.stopPropagation();
      evt.preventDefault();
      if($this.data('checked')) {
        $this.trigger('uncheck');
        // Notify MASS CHECKER
        $('.massChecker').trigger('itemchanged');
      }else{
        $this.trigger('check');
      }
      $this.blur();
    });
  })();

});
