'use strict'

import App from 'ampersand-app'

class Route {
  /**
   * @property {String} name
   * @param {Object} options
   */
  route (name, options={}) {
    if (!name) {
      throw new Error('need a route name')
    }

    const routeName = `${name}Route`
    if (!this[routeName]) {
      throw new Error(`route ${routeName} is not defined`)
    }

    const page = this[routeName]()

    if (!page) {
      throw new Error('the route should return a valid page view')
    }

    App.state.set('currentPage', page)
  }
}

module.exports = Route
