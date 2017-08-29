import 'select2'
import List from 'components/list'
import ListItem from './list-item'
import CreateUserButton from './buttons/create'
import MassDeleteButton from './buttons/mass-delete'

import HelpTexts from 'language/help'
import HelpIconView from 'components/help-icon'

module.exports = List.extend({
  initialize (options) {
    options = options || {}
    this.title = 'Users'
  },
  render () {
    List.prototype.render.apply(this,arguments)

    this.header.addMainButton( new CreateUserButton() )
    this.header.addMassiveButton( new MassDeleteButton() )
    this.renderList(ListItem,{})

    this.renderSubview(
      new HelpIconView({
        color: [255,255,255],
        category: 'title_help',
        text: HelpTexts.titles.user_page 
      }),
      this.queryByHook('title-help')
    )
  }
})
