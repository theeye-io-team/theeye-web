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

function getHashParams() {

  var hashParams = {};
  var e,
    a = /\+/g,  // Regex for replacing addition symbol with a space
    r = /([^&;=]+)=?([^&;]*)/g,
    d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
    q = window.location.hash.substring(1);

  while (e = r.exec(q)) {
    hashParams[d(e[1])] = d(e[2]);
  }

  return hashParams;
}
