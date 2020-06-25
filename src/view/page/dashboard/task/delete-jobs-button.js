import App from 'ampersand-app'
import View from 'ampersand-view'
import CommonButton from 'components/common-button'
import JobActions from 'actions/job'
import Modalizer from 'components/modalizer'

export default CommonButton.extend({
  initialize (options) {
    this.iconClass = 'fa fa-trash dropdown-icon'
    this.className = 'btn btn-primary'
  },
  events: {
		click: function (event) {
			event.stopPropagation()
			$('.dropdown.open .dropdown-toggle').dropdown('toggle')

			const body = new MessageView()
			const modal = new Modalizer({
				confirmButton: 'Delete Completed Jobs',
				buttons: true,
				title: 'Jobs Queue',
				bodyView: body
			})

			modal.on('confirm', event => {
				//App.actions.job.cleanQueue(this.model, { lifecycle: ['ready'] })
				App.actions.job.cleanQueue(this.model)
				modal.hide()
			})

			this.listenTo(modal, 'hidden', () => {
				modal.remove()
				body.remove()
			})

			modal.show()
		}
  }
})

const MessageView = View.extend({
	template: `
	  <div>
	    <span>Delete finished jobs from execution queue?
		    <div style="bottom:0; position:absolute;"> </div>
			</span>
	  </div>
	`
})
