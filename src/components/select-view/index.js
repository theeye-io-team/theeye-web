import SelectView from 'ampersand-select-view'
import extend from 'lodash/assign'

// hay que reescribir el SelectView, es medio mersa
module.exports = SelectView.extend({
  props: {
    styles: ['string',false]
  },
  initialize (opts) {
    SelectView.prototype.initialize.apply(this,arguments)
    this.styles = opts.styles
  },
  template: `
    <div data-hook="styles">
      <label class="col-sm-3 control-label" data-hook="label"></label>
      <div class="col-sm-9">
        <select class="form-control select"></select>
        <div data-hook="message-container">
          <p data-hook="message-text"></p>
        </div>
      </div>
    </div>`,
  bindings: extend({}, SelectView.prototype.bindings, {
    name: [{
      type: 'attribute',
      name: 'for',
      hook: 'label'
    }, {
      type: 'attribute',
      name: 'id',
      selector: 'select.select'
    }],
    styles: {
      type: 'attribute',
      name: 'class',
      hook: 'styles'
    }
  })
})
