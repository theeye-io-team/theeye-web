
var path = {
  basename : function (path) {
    return path.replace(/\\/g,'/').replace( /.*\//, '' );
  },
  dirname : function (path) {
    return path.replace(/\\/g,'/').replace(/\/[^\/]*$/, '');;
  }
}
