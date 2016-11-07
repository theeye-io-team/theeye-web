/* global bootbox, $searchbox, console, Clipboard */

$(function() {

  var $state = $({});

  function extractFormData (action, $el) {
    return $el.serializeArray().reduce(function(obj, input) {

      if(input.name=='customers'){
        if(!obj[input.name]) obj[input.name]=[];
        obj[input.name].push(input.value);
      }
      else if(input.name=='emails')
      {
        obj[input.name] = $("[data-hook=emails-"+action+"]").val();
      }
      else obj[input.name] = input.value;
      return obj;

    }, {});
  }

  //CREATE CUSTOMER FORM
  (function create(el){

    var $customerForm = $(el);

    $(".modal#create-customer").on('shown.bs.modal', function() {
      $customerForm.find(".hidden-container").hide();
      $customerForm.data('action','create');
      $customerForm[0].reset();
      $('[data-hook=emails-create]').tagsinput('removeAll');
      $('input[type!=hidden]',$customerForm).first().focus();
    });

    $state.on("customer_created", function() {
      bootbox.alert('Customer created', function(){
        $("create-customer").modal("hide");
        window.location.reload();
      });
    });

    $state.on("customer_create_error", function(ev, response) {
      bootbox.alert(response);
    });

    $customerForm.find("input[type=radio][name=target]").on("change", function(){
      var val = $(this).val();
      var $multihost = $customerForm.find('.hidden-container#hosts-selection');
      var $singleresource = $customerForm.find('.hidden-container#resource-selection');
      if( val == 'single-resource' ) {
        $multihost.hide(50);
        $multihost.find("option:selected").removeAttr("selected");
        $singleresource.show(50);
      } else if( val == 'multi-hosts' ){
        $singleresource.hide(50);
        $singleresource.find("select").val(0);
        $multihost.show(50);
      }
    });

    $customerForm.on("submit", function(event) {
      event.preventDefault();
      var vals = extractFormData('create', $customerForm);

      jQuery.post("/customer", vals).done(function() {
        $state.trigger("customer_created");
      }).fail(function(xhr, err) {
        $state.trigger("customer_create_error", xhr.responseText, err);
      });

      return false;
    });

  })("form#createCustomerForm");

  //EDIT USER FORM
  (function update (el){

    var $customerForm = $(el);

    function fillForm($viewElement, data){
      $viewElement[0].reset();
      Object.keys(data).forEach(function(k) {

        if(k == 'emails') {
          var emails = data[k];
          $('[data-hook=emails-edit]').tagsinput('removeAll');
          emails.forEach(function(email) {
            $('[data-hook=emails-edit]').tagsinput('add', email);
          });
        } else {
          var $el = $viewElement.find("[data-hook="+ k + "]");
          if (k == 'config') {
            var config = JSON.stringify(data[k]);
            $el.val(config);
          } else {
            $el.val(data[k]);
          }
        }
      });
    }

    $(".modal#edit-customer").on('shown.bs.modal', function(event) {
      event.preventDefault();
      event.stopPropagation();
      var customerId = event.relatedTarget.getAttribute('data-customer-id');
      $customerForm.data('customer-id',customerId);
      $customerForm.data('action','edit');
      jQuery.get("/customer/" + customerId).done(function(data) {
        fillForm($customerForm, data.customer);
      }).fail(function(xhr, err) {
        $state.trigger("customer_fetch_error", xhr.responseText, err);
      });
    });

    $state.on("customer_updated",function() {
      $(".modal#edit-customer").modal("hide");
      window.location.reload();
    });

    $state.on("customer_update_error",function(ev, resp) {
      bootbox.alert(resp);
    });

    $customerForm.on("submit", function(event) {
      event.preventDefault();
      var vals = extractFormData('edit', $customerForm);

      try {
        vals.config = JSON.parse(vals.config);
      } catch (e) {
        bootbox.alert('The Configuration provided is not a valid JSON object. Please, check again');
        return;
      }

      jQuery.ajax({
        url: '/customer/' + $customerForm.data('customer-id'),
        data: JSON.stringify(vals),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'PUT'
      }).done(function() {
        $state.trigger('customer_updated');
      }).fail(function(xhr, err) {
        $state.trigger('customer_update_error', xhr.responseText, err);
      });

      return false;
    });

    return $customerForm;
  })("form#editCustomerForm");

  (function remove(){
    $ (".deleteCustomer").on("click",function(ev){
      ev.preventDefault();
      ev.stopPropagation();

      bootbox.confirm('The customer will be removed from users (resources and checks will be disabled).<br/>Want to continue?',
      function(confirmed)
      {
        if(!confirmed) return;

        var $delTrigger = $(ev.currentTarget);
        var customerId = $delTrigger.data("customer-id");
        var customerName = $delTrigger.data("customer-name");

        $.ajax({
          url: '/customer/' + customerId,
          type: 'DELETE',
          data: { 'name': customerName }
        }).done(function() {
          location.reload();
        }).fail(function(jqxhr) {
          bootbox.alert('an error has ocurred : ' + jqxhr.status,
            function(){
              location.reload();
            });
        });
      });
    });
  })();

  (function getAgentCurl() {
    $(".seeAgentCurl").click(function(ev) {
      ev.preventDefault();
      ev.stopPropagation();
      var $curlTrigger = $(ev.currentTarget);
      var customerName = $curlTrigger.attr("data-customer-name");
      $("#user-agent").modal('show');

      $.ajax({
        url: '/customer/' + customerName + '/agent',
        type: 'GET'
      }).done(function(data){
        new Clipboard('.clipboard-btn');
        if(data.user.curl)
          $("[data-hook=curl-agent]").val(data.user.curl);
        else
          $("[data-hook=curl-agent]").val("No agent detected!");
      }).fail(function() {
        $("[data-hook=curl-agent]").val("No agent detected!");
      });
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
    var firstConfirmHeader = '<h1>Massive customer delete</h1>Heads up!<br /><br />';
    var firstConfirmFooter = '<br />will be deleted.<h2>Are you sure?</h2>';
    var secondConfirmHeader = '<h1>Hey mister!</h1>' +
      'Those are customers you are deleting, are you completely sure?<br /><br />';
    var secondConfirmFooter = '<br />WILL BE DELETED<h2>Confirm wisely</h2>';
    var successTitle = '<h1>Customers deleted</h1>';
    var successFooter = '<br/>...you will be missed :(';
    var failTitle = '<h1>Customers deleted (some)</h1>';
    var failFooter = '<br/>...I tried to delete these customers' +
      ' yet some of them came back with errors.' +
      '<br /><br />Please refresh now';
    var dataId = "itemId"; // the data-something where we get the id of the item
    var dataDescriptor = "itemName"; // the data-something where we get the name of the item
    var listTemplate = "{descriptor} ({id})<br />";
    var itemSelector = 'div.itemRow.selectedItem:visible';
    var apiUrlEndpoint = '/customer/';
    var apiRequestType = 'DELETE';

    // MASS DELETE - OJO
    $('.massDelete').on('click', function(evt){
      evt.preventDefault();
      $(this).blur();
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
              // console.log('would remove '+'div.itemRow[data-item-id='+id+']');
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
            ).always(function(){
              console.log('always');
              $.unblockUI();
            } ).done(function(){
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
