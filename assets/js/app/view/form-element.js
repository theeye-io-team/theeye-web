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
      if( input.type == 'text' ) input.value = value;
      if( input.type == 'checkbox' ) input.checked = value;
      if( input.type == 'radio' ){
        var selector = '[name=' + name + '][type=radio][value=' + String(value) + ']';
        $form.find(selector).attr('checked', true);
      }
      if( input.type == 'select-one' ) input.value = value;
      if( input.type == 'select-multiple' ) $input.val( value );
      $input.trigger('change');
    } else {
      //console.log('not found input named ' + name );
    }
  }
}
