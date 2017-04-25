'use strict'

import TemplatePageView from 'view/page/webhook'
import App from 'ampersand-app'

function Route () {
}

Route.prototype = {
  route () {
    var page = this.index()

    App.currentPage = page
  },
  index () {
    // webhooks collection
    App.state.templates.fetch()

    const selector = 'body .main-container [data-hook=page-container]'
    const container = document.querySelector(selector)

    return new TemplatePageView({
      el: container,
      collection: App.state.templates
    })
  }
}

module.exports = Route
