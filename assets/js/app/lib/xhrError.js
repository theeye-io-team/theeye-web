

var xhrError = function(xhr, err, xhrStatus) {
  if( xhr.status == 400 ){
    bootbox.alert("Your request could not be fullfiled. " + xhr.responseText);
  }
  else if( xhr.status == 500 ){
    bootbox.alert("An internal error ocurred. Please try again later");
  }
  else {
    bootbox.alert("Something went wrong. Please try again later");
  }
}
