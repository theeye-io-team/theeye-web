import App from 'ampersand-app'
import FilesPage from 'view/page/files'
import Route from 'lib/router-route'
//import bootbox from 'bootbox'

class FilesRoute extends Route {
  indexRoute () {
    App.state.tags.fetch()
    App.state.files.fetch()

    return new FilesPage({ collection: App.state.files })
  }
}

module.exports = FilesRoute
