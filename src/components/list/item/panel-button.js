import CommonButton from 'components/common-button'
export default CommonButton.extend({
  props: {
    elem: ['string',false,'button']
  },
  template () {
    return `
      <li>
        <${this.elem}>
          <span data-hook="icon-span"></span>
          <span data-hook="title"></span>
        </${this.elem}>
      </li>`
  }
})
