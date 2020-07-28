
import CheckboxView from 'ampersand-checkbox-view'

export default CheckboxView.extend({
  template: `
    <div class="form-group">
      <label data-hook="label" class="col-sm-3 control-label"></label>
      <div class="col-sm-9">
        <input type="checkbox" />
        <div data-hook="message-container">
          <p data-hook="message-text" class="alert alert-warning"></p>
        </div>
      </div>
    </div>
  `,
  props: {
    visible: ['boolean',false,true],
    value: 'boolean'
  },
  bindings: Object.assign({}, CheckboxView.prototype.bindings, {
    visible: { type: 'toggle' },
    name: [{
      type: 'attribute',
      name: 'for',
      hook: 'label'
    }, {
      type: 'attribute',
      name: 'id',
      selector: 'input'
    }]
  })
})
