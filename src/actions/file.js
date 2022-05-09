import App from 'ampersand-app'
import FileRouter from 'router/files'
import bootbox from 'bootbox'
import XHR from 'lib/xhr'
import after from 'lodash/after'
import isDataUrl from 'valid-data-url'
import isMongoId from 'validator/lib/isMongoId'

export default {
  retrieve (id) {
    if (App.state.files.get(id) === undefined) {
      const file = App.state.files.add({ id })
      file.fetch() // only file metadata. the content is not
    }
  },
  get (id, next) {
    next || (next=()=>{})
    const file = App.state.files.get(id)
    file.fetch({
      success: () => {
        XHR.send({
          url: `${App.config.supervisor_api_url}/${App.state.session.customer.name}/file/${id}/download`,
          method: 'GET',
          responseType: 'text',
          done: (response,xhr) => {
            if (response && xhr.status === 200) {
              file.data = response
              next(null, file)
            } else {
              bootbox.alert('Error getting file')
              return
            }
          },
          fail: (err,xhr) => {
            bootbox.alert('Error getting file')
            return
          }
        })
      }
    })
  },
  update (id, data, next) {
    let formData = new FormData()

    formData.append('filename', data.filename)
    formData.append('description', data.description)
    formData.append('extension', data.filename.split('.').pop())
    formData.append('mimetype', data.mimetype)

    let fileBlob = new Blob([data.data], { type: data.mimetype })
    formData.append('file', fileBlob, data.filename)

    XHR.send({
      url: `${App.config.supervisor_api_url}/${App.state.session.customer.name}/file/${id}`,
      method: 'PUT',
      formData: formData,
      done: (response,xhr) => {
        if (response && xhr.status === 200) {
          const file = App.state.files.get(id)
          file.set(response)
          next(null, file)
        } else {
          bootbox.alert('Error updating file')
          return
        }
      },
      fail: (err,xhr) => {
        bootbox.alert('Error updating file')
        return
      }
    })
  },
  create (data, next) {
    let formData = new FormData()
    formData.append('filename', data.filename)
    formData.append('description', data.description)
    formData.append('extension', data.filename.split('.').pop())
    formData.append('mimetype', data.mimetype)

    const plain = isDataUrl(data.data) ? atob(data.data.split(',')[1]) : data.data

    let fileBlob = new Blob([plain], { type: data.mimetype })
    formData.append('file', fileBlob, data.filename)

    XHR.send({
      url: `${App.config.supervisor_api_url}/${App.state.session.customer.name}/file`,
      method: 'POST',
      formData: formData,
      done: (response,xhr) => {
        const file = new App.Models.File.Model(response)
        App.state.files.add(file)
        next(null, file)
      },
      fail: (err,xhr) => {
        bootbox.alert('Error creating file')
        return
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

    next || (next = () => {})
    const file = App.state.files.get(id)
    file.is_loading = true

    XHR.send({
      url: `${App.config.supervisor_api_url}/${App.state.session.customer.name}/file/${id}/linkedmodels`,
      method: 'get',
      responseType: 'json',
      done: (models, xhr) => {
        file.is_loading = false
        if (xhr.status === 200 && Array.isArray(models)) {
          file.linked_models.reset(models)
          next(null, file)
        } else {
          next( new Error('invalid server response') )
        }
      },
      fail: (err, xhr) => {
        file.is_loading = false
        next( new Error('invalid server response') )
      }
    })
  },
  edit (value) {
    const router = new FileRouter()
    const id = (value?.id || value)

    let file
    if (typeof id === 'string') {
      if (isMongoId(id)) {
        file = App.state.files.get(id)
      }
      // route edit file action
    }

    if (file) {
      router.route('edit', { id })
    } else {
      if (value?.data) {
        router.route('import', { model: value })
      }
    }
  }
}
