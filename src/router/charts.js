'use strict'

import PageView from 'view/page/charts'
import App from 'ampersand-app'
import Route from 'lib/router-route'

class Charts extends Route {
  indexRoute () {
    const customer = App.state.session.customer
    return new PageView({
      url: customer.config.kibana
    })
  }
}

module.exports = Charts
