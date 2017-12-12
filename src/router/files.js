import App from 'ampersand-app'
import EditModalizer from 'view/page/files/edit-modalizer'
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

    App.state.tags.fetch()

    // pre fetch extra file data
    const file = new File({ id: id })
    file.fetch({
      success: () => {
        const editView = new EditModalizer({ model: file })
        editView.show()
        editView.on('hidden', () => { App.closeSubpath() })
      }
    })

    if (!App.state.currentPage) {
      return this.indexRoute()
    }
  }
}

module.exports = FilesRoute
