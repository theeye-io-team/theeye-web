/**
 * @author Facugon
 * @namespace view
 * @module page/template
 */
import App from 'ampersand-app'
import List from 'components/list'
import ListItem from './list-item'
import HelpTexts from 'language/help'
import HelpIconView from 'components/help-icon'

import MassiveDeleteButton from './buttons/massive-delete'
import CreateButton from './buttons/create'

export default List.extend({
  autoRender: true,
  initialize (options) {
    options || (options = {})
    this.title = 'Host Templates Admin'
  },
  render () {
    List.prototype.render.apply(this,arguments)

    this.header.addMainButton(new CreateButton())
    this.header.addMassiveButton(new MassiveDeleteButton())
    this.renderList(ListItem,{})

    this
      .find('span.title i[data-hook=help]')
      .html(
        new HelpIconView({
          color: [255,255,255],
          category: 'title_help',
          text: HelpTexts.titles.template_page 
        }).el
      )
  }
})
