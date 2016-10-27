/** 
 *
 * @author Facugon
 * @module FormElement
 *
 * global jquery
 *
 */
function FormElement (el){
  this.$el = $(el);
}

FormElement.prototype.get = function(){
  var $el = this.$el;
  var inputs = $el.find(":input");
  var values = {};
  inputs.each(function(){
    var input = this;
    if(!input.name) return;
    if(input.type=='checkbox') {
      if(input.value && input.value != 'on'){
        values[input.name] = input.checked ? input.value : null;
      } else {
        values[input.name] = input.checked;
      }
    } else if(input.type=='radio') {
      if( input.checked )
        values[input.name] = input.value;
    } else {
      values[input.name] = $(input).val();
    }
  });
  return values;
}

FormElement.prototype.set = function(values){
  var $form = this.$el;
  for(var name in values){
    var value = values[name];
    var $input = $form.find('[name=' + name + ']');

    var input = $input[0];
    if( input ){
      switch( input.type ){
        case 'text'||'textarea':
          input.value = value;
          break;
        case 'checkbox' :
          if( typeof value == "boolean" ){
            input.checked = value;
          } else {
            input.checked = true;
          }
          break;
        case 'radio' :
          var selector = '[name=' + name + '][type=radio][value=' + String(value) + ']';
          $form.find(selector).attr('checked', true);
          break;
        case 'select-one' :
          input.value = value;
          break;
        case 'select-multiple' :
          $input.val( value );
          break;
        default: break;
      }
      $input.trigger('change');
    } else {
      //console.warn('not found input named ' + name );
    }
  }
}
