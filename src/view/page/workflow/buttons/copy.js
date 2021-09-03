import PanelButton from 'components/list/item/panel-button'
import Modalizer from 'components/modalizer'
import $ from 'jquery'
import CopyWorkflow from './export/copy-workflow'

export default PanelButton.extend({
  initialize (options) {
    this.title = 'Copy workflow'
    this.iconClass = 'fa fa-copy dropdown-icon'
    this.className = 'btn btn-primary'
  },
  events: {
    click (event) {
      event.stopPropagation()
      $('.dropdown.open .dropdown-toggle').dropdown('toggle')
      const form = new CopyWorkflow({
        model: this.model
      })
      const modal = new Modalizer({
        buttons: false,
        title: `Copy # ${this.model.id}`,
        bodyView: form
      })

    //   this.listenTo(modal, 'shown', () => { form.focus() })

      this.listenTo(modal, 'hidden', () => {
        form.remove()
        modal.remove()
      })

      form.on('submitted', () => { modal.hide() })

      modal.show()
    }
  }
})
