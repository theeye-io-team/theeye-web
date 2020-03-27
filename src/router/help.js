import HelpPage from 'view/page/help'
import Route from 'lib/router-route'

class Help extends Route {
  indexRoute () {
    const page = new HelpPage()
    return page
  }
}

module.exports = Help
