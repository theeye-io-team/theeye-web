import App from 'ampersand-app'
import ExecButton from '../exec-button'
import TaskActions from 'actions/task'
import $ from 'jquery'

module.exports = ExecButton.extend({
  onClick (event) {
    event.stopPropagation()
    event.preventDefault()
    $(`#collapse_container_${this.model.id}`).collapse('show')
    TaskActions.populate(this.model)
    TaskActions.execute(this.model)
    return false
  }
})
