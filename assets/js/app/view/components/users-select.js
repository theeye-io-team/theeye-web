
var UsersSelect = (function(){

  var SelectView = BaseView.extend({
    tagName:'div',
    className:'form-group',
    template: Templates['assets/templates/components/users-select.hbs'],
    initialize:function(){
      this.model||(this.model={});
      this.model.title = 'ACL';
      this.model.name = 'acl';
      BaseView.prototype.initialize.apply(this,arguments);
    },
    render:function(){
      this.renderTemplate();

      this.find('select').select2({
        placeholder: 'Users',
        data: Select2Data.PrepareIdValueData(
          this.collection.map(function(u){
            return {
              text: u.attributes.email,
              id: u.attributes.email
            };
          }),{
            id:'id',
            text:'text'
          }
        ),
        tags: true
      });

    },
  });

  // module.exports = 
  return SelectView;

})();
