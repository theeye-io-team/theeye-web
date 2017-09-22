import CommonButton from 'components/common-button'
//import merge from 'lodash/merge'

module.exports = CommonButton.extend({
  template: `
    <button style="margin-left:3px">
      <span data-hook="icon-span"></span>
    </button>
  `,
})
