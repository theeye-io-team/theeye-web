import View from 'ampersand-view'

import $ from 'jquery'

module.exports = View.extend({
  autoRender: true,
  find: function (selector) {
    return $(this.el).find(selector)
  }
})
