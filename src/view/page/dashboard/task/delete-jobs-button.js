import CommonButton from 'components/common-button'
import JobActions from 'actions/job'
import bootbox from 'bootbox'
import $ from 'jquery'

module.exports = CommonButton.extend({
  initialize (options) {
    this.iconClass = 'fa fa-trash dropdown-icon'
    this.className = 'btn btn-primary'
  },
  events: {
    click: function (event) {
      event.stopPropagation()
      $('.dropdown.open .dropdown-toggle').dropdown('toggle')

      bootbox.confirm({
        message: `Delete finished jobs from execution history?`,
        backdrop: true,
        callback: (confirmed) => {
          if (confirmed) {
            JobActions.removeFinished(this.model)
          }
        }
      })
    }
  }
})
