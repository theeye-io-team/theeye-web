import ScriptCollapsibleRow from './script'
import * as TaskConstants from 'constants/task'
import { Images as IconsImages } from 'constants/icons'

export default ScriptCollapsibleRow.extend({
  derived: {
    type: {
      fn: () => TaskConstants.TYPE_NODEJS
    },
    //type_icon: {
    //  // MUST BE UPDATED !!
    //  fn: () => 'fa fa-code'
    //},
    //header_type_icon: {
    //  // MUST BE UPDATED !!
    //  fn: () => 'circle fa fa-code script-color'
    //},
    image: {
      deps: ['model.icon_image'],
      fn () {
        return (this.model.icon_image || IconsImages.nodejs)
      }
    }
  }
})
