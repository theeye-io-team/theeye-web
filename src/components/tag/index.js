
const View = require('ampersand-view')
import './styles.less'

module.exports = View.extend({
  template: `<span class="tag label label-default" data-hook="name"></span>`,
  bindings: {
    'model.name': {
      hook: 'name'
    }
  }
})
