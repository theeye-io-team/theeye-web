$(function(){

  window.setCustomer = function (customer) {
    $.post('/setcustomer/' + customer, {}, function(data, status, jqxhr) {
      if(status !== 'success' || jqxhr.status !== 200)
        alert('Error setting customer!');
      else {
        $.blockUI();
        location.reload();
      }
    }, 'json');
  };

  window.alert = function(msg, title, cbk) {
    var $alert = $("#alert");

    $alert.find(".modal-body").html(msg);
    if (title) {
      $alert.find(".modal-title").html(title);
    }
    $("#alert").one('hidden.bs.modal', function () {
      if(cbk) cbk();
      // do something…
    });
    $("#alert").modal("show");
  };

  $(function () {
    $('[data-toggle="tooltip"]').tooltip();
  });

});

function is_touch_device() {
  return (('ontouchstart' in window)
    || (navigator.MaxTouchPoints > 0)
    || (navigator.msMaxTouchPoints > 0));
}
