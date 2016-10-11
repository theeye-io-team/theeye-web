

var PasswordResetPage = function(options){

  return Page = new (
    BaseView.extend({
      events:{
        'click button[data-hook=submit]': 'onClickSubmitButton'
      },
      onClickSubmitButton: function(event){
        event.preventDefault();
        event.stopPropagation();

        var data = {
          token: options.token,
          password : this.find('input[name=password]').val(),
          confirmation : this.find('input[name=confirmation]').val()
        }

        $.ajax({
          method: 'PUT',
          url: '/password/reset',
          data: data
        })
        .done(function(){
          bootbox.alert('Your new password has been set.');
        })
        .fail( xhrError );
      }
    })
  )({ el: $('form[data-hook=password]')[0] });

}
