'use strict'

import App from 'ampersand-app'
import { Model as File } from 'models/file'
import FileRouter from 'router/files'
import bootbox from 'bootbox'
const config = require('config')
import XHR from 'lib/xhr'

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
    //check if file has vinculations
    this.syncLinkedModels(id, (err, file) => {
      if (err) {
        bootbox.alert('Error deleting file. %s', err)
        return
      }

      if (file.linked_models.length > 0) {
        bootbox.alert("The file is being used by a Monitor or Task and can't be deleted.")
      } else {
        file.destroy()
      }
    })
  },
  syncLinkedModels (id, next) {
    const file = App.state.files.get(id)
    XHR.send({
      url: `${config.app_url}/apiv3/file/${id}/linkedmodels`,
      method: 'get',
      headers: { Accept: 'application/json;charset=UTF-8' },
      done: (models, xhr) => {
        if (xhr.status === 200 && Array.isArray(models)) {
          file.linked_models = models
          next(null, file)
        } else {
          next( new Error('invalid server response') )
        }
      },
      fail: (err, xhr) => {
        next( new Error('invalid server response') )
      }
    })
  },
  edit (id) {
    // route edit file action
    let router = new FileRouter()
    router.route('edit', { id: id })
  }
}
