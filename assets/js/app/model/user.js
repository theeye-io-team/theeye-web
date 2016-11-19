window.App || ( window.App = {} );
window.App.Models || ( window.App.Models = {} );
window.App.Models.User = BaseModel.extend({
  urlRoot:'/api/user',
  parse: function (response) {
    return response;
  },
  initialize: function () {
    // constructor
    return this;
  }
});


window.App.Collections || ( window.App.Collections = {} );
window.App.Collections.Users = Backbone.Collection.extend({
  model: window.App.Models.User,
  url:'/api/user'
});
