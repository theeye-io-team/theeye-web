window.App || ( window.App = {} );
window.App.Models || ( window.App.Models = {} );
window.App.Models.Webhook = Backbone.Model.extend({
  urlRoot:'/api/webhook',
  parse:function(response){
    response.hosts = [ response.host_id ];
    return response;
  },
  initialize:function(){
    Object.defineProperty(this,'triggerUrl',{
      get: function() {
        var cookie = Cookies.getJSON('theeye');
        var url = cookie.supervisor_url;
        var customer = cookie.customer;

        return url + '/' + customer + '/webhook/' +
          this.id + '/trigger/secret/' + this.attributes.secret ;
      }
    });
  }
});


window.App.Collections || ( window.App.Collections = {} );
window.App.Collections.Webhooks = Backbone.Collection.extend({
  model: window.App.Models.Webhook,
  url:'/api/webhook'
});
