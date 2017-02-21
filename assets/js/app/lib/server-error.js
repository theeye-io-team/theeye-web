
var ServerError = function(response){

  function handleErrorBody (body) {
    var codes = {'EREQ':'Required','EVALID':'Invalid'};

    if (Array.isArray(body)) {
      var msg = '<br>The following fields has errors:';
      body.forEach(function(e){
        msg += '<br>' + e.field.toUpperCase() + ' is ' + codes[e.code];
      });
      bootbox.alert(msg);
    }
  }

  handleErrorBody(response.body);

};
