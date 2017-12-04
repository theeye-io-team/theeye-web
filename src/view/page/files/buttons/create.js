import View from 'ampersand-view'
import CommonButton from 'components/common-button'
import Modalizer from 'components/modalizer'
import FileActions from 'actions/file'
import HelpTexts from 'language/help'
import HelpIconView from 'components/help-icon'
import { Model as FileModel } from 'models/file'

import FileForm from '../form'

import './buttons.less'

module.exports = CommonButton.extend({
  initialize (options) {
    this.title = 'Create New File'
    this.className = 'btn btn-primary'
    this.iconClass = 'fa fa-plus'
  },
  events: {
    click (event) {
      event.preventDefault()
      event.stopPropagation()

      const form = new FileForm({ model: new FileModel () })
      const modal = new Modalizer({
        buttons: false,
        title: this.title,
        bodyView: form
      })

      //this.listenTo(modal,'shown',() => { select.focus() })
      this.listenTo(modal,'hidden',() => {
        form.remove()
        modal.remove()
      })
      this.listenTo(form,'submit',() => { modal.hide() })
      modal.show()
    }
  }
})
