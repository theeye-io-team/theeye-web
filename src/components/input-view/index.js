var InputView = require('ampersand-input-view')
var extend = require('lodash/assign')

/**
 *
 * This is a custom template InputView
 * that use <div> instead of <label>
 *
 */
module.exports = InputView.extend({
  template: `
    <div>
      <label class="col-sm-3 control-label" data-hook="label"></label>
      <div class="col-sm-9">
        <input class="form-control form-input">
        <div data-hook="message-container" class="message message-below message-error">
          <p data-hook="message-text"></p>
        </div>
      </div>
    </div>
  `,
  props: {
    styles: ['string',false,'form-group']
  },
  bindings: extend({}, InputView.prototype.bindings, {
    styles: {
      type: 'attribute',
      name: 'class'
    }
  })
})
