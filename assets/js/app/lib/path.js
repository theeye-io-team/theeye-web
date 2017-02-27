
var path = (function(){
  return {
    basename:function(path){
      return path
        .replace( new RegExp('\\\\','g'), '/' )
        .replace( new RegExp('.*\/'), '' );
    },
    dirname:function(path){
      return path
        .replace( new RegExp('\\\\','g'), '/' )
        .replace( new RegExp('\/[^\/]*$'), '' );
    }
  }
})();
