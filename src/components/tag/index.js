
const View = require('ampersand-view')
import SearchboxActions from 'actions/searchbox'
import './styles.less'

module.exports = View.extend({
  template: `<span class="tag label label-default" data-hook="name"></span>`,
  bindings: {
    'model.name': {
      hook: 'name'
    }
  },
  events: {
    click: 'onClick'
  },
  onClick (event) {
    event.stopPropagation()
    event.preventDefault()
    SearchboxActions.search(this.model.name)
  }
})
