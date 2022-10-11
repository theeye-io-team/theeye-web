import App from 'ampersand-app'
import XHR from 'lib/xhr'
import MarketplaceView from 'view/marketplace'

export default {
  hide () {
    App.state.marketplace.visible = false
  },
  show () {
    const state = App.state.marketplace
    state.current_tab = state.default_tab
    state.visible = true 

    const view = new MarketplaceView()
    view.render()
  },
  toggle () {
    App.state.marketplace.toggle('visible')
  },
  toggleTab (tabId) {
    App.state.marketplace.current_tab = tabId
  },
  fetch (type) {
    if (App.state.marketplace[type].length > 0) {
      // already fetched
      return
    }

    if (
      !App.config.components?.marketplace ||
      App.config.components.marketplace?.enabled !== true
    ) {
      App.state.marketplace[type] = []
      return
    }

    XHR.send({
      method: 'GET',
      url: marketplaceBaseUrl(type),
      done (list) {
        App.state.marketplace[type] = list
      },
      fail (err, xhr) {
        App.state.alerts.danger('Marketplace fetch failed')
        console.error(err)
      }
    })
  },
  getSerialization (id, type) {
    if (
      !App.config.components?.marketplace ||
      App.config.components.marketplace?.enabled !== true
    ) {
      return null
    }

    return new Promise((resolve, reject) => {
      XHR.send({
        method: 'GET',
        url: `${marketplaceBaseUrl(type)}/${id}/serialize`,
        done: resolve,
        fail: reject
      })
    })
  }
}

const marketplaceBaseUrl = (type) => {
  const apiModelsMap = {
    'tasks': 'task',
    'monitors': 'monitor',
    'indicators': 'indicator',
    'workflows': 'workflow'
  }

  return `${App.config.components.marketplace.url}/${apiModelsMap[type]}`
}
