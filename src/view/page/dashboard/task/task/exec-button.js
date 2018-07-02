import App from 'ampersand-app'
import ExecButton from '../exec-button'
import {ExecTask, ExecApprovalTask} from './exec-task.js'
import TaskConstants from 'constants/task'
import bootbox from 'bootbox'

module.exports = ExecButton.extend({
  onClickExecute (event) {
    event.stopPropagation()
    event.preventDefault()
    this.execute()
    return false
  },
  render () {
    ExecButton.prototype.render.apply(this, arguments)

    this.listenTo(this.model, 'execution', () => {
      this.execute()
    })
  },
  execute () {
    var execTask
    if (!App.state.session.licenseExpired) {
      if (this.model.type === TaskConstants.TYPE_APPROVAL) {
        execTask = new ExecApprovalTask({model: this.model})
      } else {
        execTask = new ExecTask({model: this.model})
      }
      execTask.execute()
    } else {
      bootbox.alert('Your license has expired! </br> Please contact your service provider to activate the product again.')
    }
  }
})
