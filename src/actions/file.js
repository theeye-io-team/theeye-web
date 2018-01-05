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
    const file = App.state.files.get(id)
    //check if file has vinculations
    XHR.send({
      url: `${config.app_url}/apiv3/file/${id}/linkedmodels`,
      method: 'get',
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done: (models,xhr) => {
        if (xhr.status == 200) {
          if (Array.isArray(models)) {
            if (models.length > 0) {
              bootbox.alert('This File cannot be deleted. It is linked to monitors or tasks.')
            } else {
              file.destroy()
            }
          } else {
            bootbox.alert('Error deleting file.')
          }
        } else {
          bootbox.alert('Error deleting file.')
        }
      },
      fail: (err,xhr) => {
        bootbox.alert('Error deleting file.')
      }
    })
  },
  edit (id) {
    // route edit file action
    let router = new FileRouter()
    router.route('edit', { id: id })
  }
}
