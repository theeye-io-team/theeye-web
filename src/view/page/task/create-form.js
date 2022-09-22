import App from 'ampersand-app'
import Modalizer from "components/modalizer"
import TaskFormView from 'view/page/task/form'

export const importForm = (task) => {
  let script, mode = 'import'
  if (task.script_id) {
    script = App.state.files.get(task.script_id)
    if (!script) {
      task.script_id = null
    } else {
      mode = null
    }
  }

  script || (script = task.script)

  const form = new TaskFormView({ model: task, mode })
  const modal = new Modalizer({
    title: 'Import task',
    bodyView: form
  })
  
  form.on('submit', data => {
    data.script = script.serialize() // data from imported file. was not persisted yet
    if (this.submit) {
      this.submit(data)
    } else {
      App.actions.task.create(data)
    }
    modal.remove()
    form.remove()
  })

  modal.show()
}
