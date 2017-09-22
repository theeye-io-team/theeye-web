import SelectView from 'ampersand-select-view'
import mergeWith from 'lodash/mergeWith'
import compact from 'lodash/compact'
import concat from 'lodash/concat'

// hay que reescribir el SelectView, es medio mersa
module.exports = SelectView.extend({
  template: `
    <div class="form-group form-horizontal">
      <label data-hook="label" class="col-sm-3 control-label"></label>
      <div class="col-sm-9">
        <select class="form-control select"></select>
        <div data-hook="message-container">
          <p data-hook="message-text" class="alert alert-warning"></p>
        </div>
      </div>
    </div>`,

  bindings: mergeWith({}, SelectView.prototype.bindings, {
    name: [{
      type: 'attribute',
      name: 'for',
      hook: 'label'
    }, {
      type: 'attribute',
      name: 'id',
      selector: 'select.select'
    }]
  }, customizer)
})

function customizer (objValue, srcValue) {
  return compact(concat(objValue, srcValue))
}
