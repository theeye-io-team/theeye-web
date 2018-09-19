import ListItem from 'components/list/item'
import View from 'ampersand-view'
import EditButton from './buttons/edit'
import DeleteButton from './buttons/delete'
import ExportButton from './buttons/export'

module.exports = ListItem.extend({
  derived: {
    item_name: {
      deps: ['model.name'],
      fn () {
        return this.model.name
      }
    },
    item_description: {
      fn () {
        return ''
      }
    }
  },
  render () {
    ListItem.prototype.render.apply(this,arguments)

    this.addButtons([
      { view: ExportButton, params: { model: this.model } },
      { view: EditButton, params: { model: this.model } },
      { view: DeleteButton, params: { model: this.model } }
    ])

    this.renderSubview(
      new Collapsed({ model: this.model }),
      this.queryByHook('collapsed-content')
    )
  }
})

const Collapsed = View.extend({
  bindings: {
    'model.description': {
      type: 'text',
      hook: 'description'
    }
  },
  template: `
    <div class="col-sm-12">
      <h4>Template Information</h4>
      <span>Description: </span><span data-hook="description"></span>
    </div>
  `
})
