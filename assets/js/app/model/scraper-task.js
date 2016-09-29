window.App = window.App || {};
window.App.Models = window.App.Models || {};

window.App.Models.ScraperTask = Backbone.Model.extend({
  urlRoot:'/task',
  parse:function(response){
    response.hosts = [ response.host_id ];
    return response;
  }
});
