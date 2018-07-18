/**
 * @author Facugon
 * @namespace view
 * @module page/scripts
 */
import App from 'ampersand-app'
import List from 'components/list'
import HelpTexts from 'language/help'
import HelpIconView from 'components/help-icon'
import ListItem from './list-item'

import MassiveDeleteButton from './buttons/massive-delete'
import CreateButton from './buttons/create'

module.exports = List.extend({
  autoRender: true,
  initialize (options) {
    options || (options = {})
    this.title = 'Files & Scripts'
  },
  render () {
    List.prototype.render.apply(this,arguments)
    this.header.addMainButton(new CreateButton())
    this.header.addMassiveButton(new MassiveDeleteButton())
    this.renderList(ListItem,{})
    this.renderSubview(
      new HelpIconView({
        color: [255,255,255],
        category: 'title_help',
        text: HelpTexts.titles.file_page 
      }),
      this.queryByHook('title-help')
    )
  }
})
