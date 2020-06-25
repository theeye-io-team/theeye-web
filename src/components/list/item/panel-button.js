'use strict'
import CommonButton from 'components/common-button'
export default CommonButton.extend({
  template: `
    <li>
      <button>
        <span data-hook="icon-span"></span>
        <span data-hook="title"></span>
      </button>
    </li>
  `
})
