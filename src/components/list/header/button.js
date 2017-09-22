import CommonButton from 'components/common-button'
import merge from 'lodash/merge'

module.exports = CommonButton.extend({
  template: `
    <button data-placement="right">
      <span data-hook="icon-span"></span>
      <span data-hook="text"></span>
    </button>`,
  bindings: merge({}, CommonButton.prototype.bindings, {
    title: {
      hook: 'text'
    }
  })
})
