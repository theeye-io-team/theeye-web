import View from 'ampersand-view'

import $ from 'jquery'

export default View.extend({
  autoRender: true,
  find: function (selector) {
    return $(this.el).find(selector)
  }
})
