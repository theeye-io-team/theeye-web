import InputView from 'ampersand-input-view'
import mergeWith from 'lodash/mergeWith'
import compact from 'lodash/compact'
import concat from 'lodash/concat'

module.exports = InputView.extend({
  template: `
    <div class="form-group">
      <label data-hook="label" class="col-sm-3 control-label"></label>
      <div class="col-sm-9">
        <input type="text" class="form-control form-input">
        <div data-hook="message-container">
          <p data-hook="message-text" class="alert alert-warning"></p>
        </div>
      </div>
    </div>`,
  props: {
    disable: ['boolean', false, false]
  },
  bindings: mergeWith({}, InputView.prototype.bindings, {
    disable: {
      type: 'booleanAttribute',
      name: 'disabled',
      selector: '.form-input'
    },
    name: [{
      type: 'attribute',
      name: 'for',
      hook: 'label'
    }, {
      type: 'attribute',
      name: 'id',
      selector: 'input.form-input'
    }]
  }, customizer)
})

function customizer (objValue, srcValue) {
  return compact(concat(objValue, srcValue))
}
