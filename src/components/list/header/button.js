import CommonButton from 'components/common-button'

export default CommonButton.extend({
  template: `
    <button data-placement="right">
      <span data-hook="icon-span"></span>
      <span data-hook="text"></span>
    </button>
  `,
  bindings: Object.assign({}, CommonButton.prototype.bindings, {
    title: {
      hook: 'text'
    }
  })
})
