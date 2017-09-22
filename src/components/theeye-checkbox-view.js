import CheckboxView from 'ampersand-checkbox-view'
import mergeWith from 'lodash/mergeWith'
import compact from 'lodash/compact'
import concat from 'lodash/concat'

module.exports = CheckboxView.extend({
  template: `
    <div class="form-group">
      <label data-hook="label" class="col-sm-3 control-label"></label>
      <div class="col-sm-9">
        <input type="checkbox" />
        <div data-hook="message-container">
          <p data-hook="message-text" class="alert alert-warning"></p>
        </div>
      </div>
    </div>`,
  bindings: mergeWith({}, CheckboxView.prototype.bindings, {
    name: [{
      type: 'attribute',
      name: 'for',
      hook: 'label'
    }, {
      type: 'attribute',
      name: 'id',
      selector: 'input'
    }]
  }, customizer)
})

function customizer (objValue, srcValue) {
  return compact(concat(objValue, srcValue))
}
