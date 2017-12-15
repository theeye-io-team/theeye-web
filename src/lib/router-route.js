'use strict'

import App from 'ampersand-app'
import Events from 'ampersand-events'
import assign from 'lodash/assign'

class Route {
  /**
   * @property {String} name
   * @param {Object} options
   */
  route (name, options = {}) {
    if (!name) {
      throw new Error('need a route name')
    }

    const routeName = `${name}Route`
    if (!this[routeName]) {
      throw new Error(`route ${routeName} is not valid`)
    }

    const page = this[routeName](options)

    if (!page) {
      if (!App.state.currentPage) {
        let errmsg = 'the route should return a valid page view'
        throw new Error(errmsg)
      } else return
    }

    App.state.set('currentPage', page)
  }
}

assign(Route.prototype, Events)

export default Route
