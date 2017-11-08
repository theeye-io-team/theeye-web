'use strict'
import CommonButton from 'components/common-button'
module.exports = CommonButton.extend({
  template: `
    <li>
      <button>
        <span data-hook="icon-span"></span>
      </button>
    </li>
  `
})
