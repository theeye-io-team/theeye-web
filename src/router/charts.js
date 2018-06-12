'use strict'

import PageView from 'view/page/charts'
import App from 'ampersand-app'
import Route from 'lib/router-route'

class Charts extends Route {
  indexRoute (options) {
    const { integration = '' } = options
    const config = App.state.session.customer.config[integration]
    let url = ''

    if (!config) {
      url = ''
    } else if (integration.toLowerCase() === 'kibana') {
      // accept old configs for kibana
      url = config.url || config
    } else {
      // generic integrations here
      url = config.url
    }
    return new PageView({
      url: url || 'https://app.theeye.io/404'
    })
  }
}

module.exports = Charts
