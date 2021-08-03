import View from 'ampersand-view'
import CommonButton from 'components/common-button'
import Modalizer from 'components/modalizer'
import HelpTexts from 'language/help'
import HelpIconView from 'components/help-icon'
import { Model as FileModel } from 'models/file'
import CreationWizard from '../creation-wizard'

import FileForm from '../form'

import './buttons.less'

export default CommonButton.extend({
  initialize (options) {
    this.title = 'Create New File'
    this.className = 'btn btn-primary'
    this.iconClass = 'fa fa-plus'
  },
  events: {
    click (event) {
      event.preventDefault()
      event.stopPropagation()

      new CreationWizard()
    }
  }
})
