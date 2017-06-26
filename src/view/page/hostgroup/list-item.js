import ListItem from 'components/list/item'
import View from 'ampersand-view'
import EditButton from './buttons/edit'
import DeleteButton from './buttons/delete'

export default ListItem.extend({
  derived: {
    item_name: {
      deps: ['model.name'],
      fn () {
        return this.model.name
      }
    },
    item_description: {
      deps: ['model.description'],
      fn () {
        return this.model.description
      }
    }
  },
  render () {
    ListItem.prototype.render.apply(this,arguments)

    this.addButtons([
      new EditButton({ model: this.model }),
      new DeleteButton({ model: this.model }),
    ])

    this.renderSubview(
      new Collapsed({ model: this.model }),
      this.queryByHook('collapsed-content')
    )
  }
})

const Collapsed = View.extend({
  template: `
      <div class="col-sm-12">
        <h4>Template Information</h4>
      </div>
  `,
})
