'use strict'

import App from 'ampersand-app'
import { Model as File } from 'models/file'
import FileRouter from 'router/files'

export default {
  get (id) {
    const file = App.state.files.get(id)
    file.fetch()
    return file
  },
  update (id, data) {
    const file = App.state.files.get(id)
    file.set(data)
    file.save()
    return file
  },
  create (data) {
    const file = new File(data)
    file.save()
    App.state.files.add(file)
    return file
  },
  remove (id) {
    const file = App.state.files.get(id)
    file.destroy()
  },
  edit (id) {
    // route edit file action
    let router = new FileRouter()
    router.route('edit', { id: id })
  }
}
