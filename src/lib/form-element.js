/**
 *
 * @author Facugon
 * @module FormElement
 *
 * global jquery
 *
 * how to use :
 *
 * 1. include.
 * 2. just instantiate with the element as argument
 * 3. you can then set values from an object to the form
 * 4. and you can get the values as an object
 *
 * code :
 *
 * var form = new FormElement( $('form') );
 *
 * // set the form using object key as input name
 * form.set({ name:'Facugon', class:'spartan', profession:'AHOO! AHOO! AHOO!' }); // asuming there is inputs with that names
 *
 * // get an object with the form data. use input names as key
 * var data = form.get();
 *
 */

import $ from 'jquery'

function FormElement (el) {
  this.$el = (el instanceof jQuery) ? el : $(el)
}

module.exports = FormElement

FormElement.prototype.reset = function () {
  this.$el[0].reset()
}

FormElement.prototype.get = function () {
  var $el = this.$el
  var inputs = $el.find(':input')
  var values = {}
  inputs.each(function () {
    var input = this
    if (!input.name) return
    if (input.type === 'checkbox') {
      if (input.value && input.value !== 'on') {
        values[input.name] = input.checked ? input.value : null
      } else {
        values[input.name] = input.checked
      }
    } else if (input.type === 'radio') {
      if (input.checked) {
        values[input.name] = input.value
      }
    } else {
      values[input.name] = $(input).val()
    }
  })
  return values
}

FormElement.prototype.set = function (values) {
  var $form = this.$el
  for (var name in values) {
    var value = values[name]
    var $input = $form.find('[name=' + name + ']')

    var input = $input[0]
    if (input) {
      switch (input.type) {
        case 'text':
        case 'textarea':
          input.value = value
          break
        case 'checkbox' :
          if (typeof value === 'boolean') {
            input.checked = value
          } else {
            input.checked = true
          }
          break
        case 'radio' :
          var selector = '[name=' + name + '][type=radio][value=' + String(value) + ']'
          $form.find(selector).attr('checked', true)
          break
        case 'select-one' :
          input.value = value
          break
        case 'select-multiple' :
          $input.val(value)
          break
        default: break
      }
      $input.trigger('change')
    } else {
      // console.warn('not found input named ' + name );
    }
  }
}
