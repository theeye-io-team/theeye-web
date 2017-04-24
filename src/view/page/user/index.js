import 'select2'
import List from 'components/list'
import ListItem from './list-item'
import CreateUserButton from './buttons/create'
import MassDeleteButton from './buttons/mass-delete'

module.exports = List.extend({
  initialize (options) {
    options = options || {}
    this.title = 'Users Admin'
  },
  render () {
    List.prototype.render.apply(this,arguments)

    this.header.addMainButton( new CreateUserButton() )
    this.header.addMassiveButton( new MassDeleteButton() )
    this.renderList(ListItem,{})
  }
})
