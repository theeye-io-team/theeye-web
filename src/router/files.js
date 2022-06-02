import App from 'ampersand-app'
import EditModalizer from 'view/page/files/edit-modalizer'
import ImportModalizer from 'view/page/files/import-modalizer'
import FilesPage from 'view/page/files'
import { Model as File } from 'models/file'
import Route from 'lib/router-route'
//import bootbox from 'bootbox'

class FilesRoute extends Route {
  indexRoute () {
    App.state.tags.fetch()
    App.state.files.fetch()

    return new FilesPage({ collection: App.state.files })
  }

  editRoute (options) {
    const id = options.id

    App.state.members.fetch()
    App.state.tags.fetch()

    // pre fetch extra file data
    const file = App.actions.file.get(id, function (err, file) {
      const editView = new EditModalizer({ model: file })
      editView.show()
    })

    if (!App.state.currentPage) {
      return this.indexRoute()
    }
  }

  importRoute (options) {
    const model = options.model
    const importView = new ImportModalizer({ file: model.serialize() })
    importView.show()
    if (!App.state.currentPage) {
      return this.indexRoute()
    }
  }
}

export default FilesRoute
