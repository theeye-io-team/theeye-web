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

    $customerForm.on('submit',function(event){
      event.preventDefault();

      var form = new FormElement( $customerForm );
      var data = form.get();

      $.ajax({
        url:'/customer',
        method:'POST',
        data: data
      }).done(function() {
        bootbox.alert('Customer created', function(){
          $("create-customer").modal("hide");
          window.location.reload();
        });
      }).fail(function(xhr, err) {
        bootbox.alert(response);
      });

      return false;
    });

  })("form#createCustomerForm");

  //EDIT USER FORM
  (function update (el){

    var $customerForm = $(el);

    $(".modal#edit-customer").on('show.bs.modal',function(event){
      var id = event.relatedTarget.getAttribute('data-customer-id');
      $customerForm[0].reset();
      $customerForm.data('customer-id',id);
      $customerForm.data('action','edit');

      jQuery.get('/customer/' + id)
        .done(function(data){
          var form = new FormElement($customerForm);
          var customer = data.customer;
          customer.elasticsearch = JSON.stringify(customer.config.elasticsearch);
          customer.kibana = customer.config.kibana||'';
          form.set(customer);

          // reset tags input
          var $emails = $('[data-hook=emails]');
          $emails.tagsinput('removeAll');
          customer.emails.forEach(function(email){
            $emails.tagsinput('add',email);
          });
        })
        .fail(function(xhr, err) {
        });
    });

    function setConfiguration (data) {
      var elasticsearch = data.elasticsearch;
      var kibana = data.kibana;
      var updates = { config: {} };
      // convert config into an object
      try {
        updates.config.elasticsearch = JSON.parse(elasticsearch);
      } catch (e) {
        bootbox.alert('The Elastic Search configuration is not a valid JSON object. Please, try again');
        return null;
      }
      updates.config.kibana = kibana;
      return updates;
    }

    $customerForm.on("submit", function(event) {
      event.preventDefault();

      var form = new FormElement( $customerForm );
      var data = form.get();

      var updates = setConfiguration(data);
      if (!updates) return;

      updates.description = data.description;
      updates.emails = data.emails;

      jQuery.ajax({
        url: '/customer/' + $customerForm.data('customer-id'),
        data: JSON.stringify(updates),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'PUT'
      }).done(function() {
        bootbox.alert('customer updated',function(){
          $(".modal#edit-customer").modal("hide");
          window.location.reload();
        });
      }).fail(function(xhr, err) {
        bootbox.alert(resp);
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
