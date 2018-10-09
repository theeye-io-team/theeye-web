'use strict'

import App from 'ampersand-app'
import { Model as File } from 'models/file'
import FileRouter from 'router/files'
import bootbox from 'bootbox'
const config = require('config')
import XHR from 'lib/xhr'
import after from 'lodash/after'

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
  create (data, next) {
    next || (next = function(){})
    const file = new File(data)
    file.save({}, {
      collection: App.state.files,
      success: function () {
        App.state.files.add(file)
        next(null, file)
      },
      error: function (err) {
        if (err) {
          bootbox.alert('Error creating file')
          return
        }
        next(err)
      }
    })
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
  massiveDelete (models) {
    App.state.loader.visible = true

    var errors = 0
    const done = after(models.length, () => {
      if (errors > 0) {
        const count = (errors === models.length) ? 'all' : 'some of'
        bootbox.alert(
          `Well, ${count} the delete request came back with error. Reloding now...`,() => {
            //window.location.reload()
            App.Router.reload()
          }
        )
      } else {
        App.state.loader.visible = false
        bootbox.alert('That\'s it, they are gone. Congrats.',() => { })
      }
    })

    models.forEach(model => {
      model.destroy({
        success () {
          App.state.files.remove(model)
          done()
        },
        error () {
          errors++
          done()
        }
      })
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
