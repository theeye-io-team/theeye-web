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

    $(".modal#create-customer").on('shown.bs.modal', function(event) {
      $customerForm.find(".hidden-container").hide();
      $customerForm.data('action','create');
      $customerForm[0].reset();
      $('[data-hook=emails-create]').tagsinput('removeAll');
    });

    $state.on("customer_created", function() {
      bootbox.alert('customer created', function(){
        $("create-customer").modal("hide");
        window.location.reload();
      });
    });

    $state.on("customer_create_error", function(ev, response, error) {
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

      jQuery.post("/customer", vals).done(function(data) {
        $state.trigger("customer_created");
      }).fail(function(xhr, err, xhrStatus) {
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
      Object.keys(data).forEach(function(k)
      {

        if(k == 'emails')
        {
          var emails = data[k];
          $('[data-hook=emails-edit]').tagsinput('removeAll');
          emails.forEach(function(email)
          {
            $('[data-hook=emails-edit]').tagsinput('add', email);

          });
        }
        else
        {
          var $el = $viewElement.find("[data-hook="+ k + "]");
          $el.val(data[k]);
        }
      })
    }

    $(".modal#edit-customer").on('shown.bs.modal', function(event) {
      event.preventDefault();
      event.stopPropagation();
      var customerId = event.relatedTarget.getAttribute('data-customer-id');
      $customerForm.data('customer-id',customerId);
      $customerForm.data('action','edit');
      jQuery.get("/customer/" + customerId).done(function(data)
      {
        fillForm($customerForm, data.customer);
      }).fail(function(xhr, err, xhrStatus) {
        $state.trigger("customer_fetch_error", xhr.responseText, err);
      });
    });

    $state.on("customer_updated",function() {
      $(".modal#edit-customer").modal("hide");
      window.location.reload();
    });

    $state.on("customer_update_error",function(ev, resp, error) {
      bootbox.alert(resp);
    });

    $customerForm.on("submit", function(event) {
      event.preventDefault();
      var vals = extractFormData('edit', $customerForm);

      jQuery.ajax({
        url:"/customer/" + $customerForm.data('customer-id'),
        data:vals,
        type:'put'
      }).done(function(data) {
        $state.trigger("customer_updated");
      }).fail(function(xhr, err, xhrStatus) {
        $state.trigger("customer_update_error", xhr.responseText, err);
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
        }).done(function(data) {
          location.reload();
        }).fail(function(jqxhr, txtstatus, error) {
          bootbox.alert('an error has ocurred : ' + jqxhr.status,
            function(){
              location.reload();
            });
        });
      });
    });
  })();

  (function getAgentCurl(customerName) {
    $(".seeAgentCurl").click(function(ev)
    {
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
      }).fail(function(xhr, err, xhrStatus) {
        $("[data-hook=curl-agent]").val("No agent detected!");
      });
    });
  })();

});
