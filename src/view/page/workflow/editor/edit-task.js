import App from 'ampersand-app'
import isMongoId from 'validator/lib/isMongoId'
import * as WorkflowConstants from 'constants/workflow'
import TaskForm from 'view/page/task/form'
import Modalizer from 'components/modalizer'

export default (task, done) => {
  let mode
  if (!task.script_id) {
    mode = WorkflowConstants.MODE_IMPORT
  }

  const form = new TaskForm({ model: task, mode })
  const modal = new Modalizer({
    buttons: false,
    title: `Edit task ${task.name} [${task.id}]`,
    bodyView: form
  })

  modal.on('hidden', () => {
    form.remove()
    modal.remove()
  })

  form.on('submit', data => {
    if (isMongoId(task.id)) {
      App.actions.task.update(task.id, data)
    } else {
      task.set(data)
    }

    done(task)
    modal.hide()
  })

  modal.show()
}

