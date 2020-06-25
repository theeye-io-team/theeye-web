import CreationWizard from '../creation-wizard'
import CommonButton from 'components/common-button'

export default CommonButton.extend({
  initialize (options) {
    this.title = 'Create a New Task'
    this.className = (options && options.className) || 'btn btn-primary'
    this.iconClass = 'fa fa-plus'
  },
  events: {
    'click':'onClick'
  },
  onClick (event) {
    event.preventDefault()
    let wizard = new CreationWizard()
  }
})
