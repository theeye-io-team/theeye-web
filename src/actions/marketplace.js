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

    XHR.send({
      method: 'GET',
      url: `${App.config.marketplace_api.url}/task?unassigned=true`,
      authorization: `Bearer ${App.config.marketplace_api.bearer}`,
      done (list) {
        App.state.marketplace[type] = list.map(data => { 
          return {
            name: data.name,
            id: data.id,
            description: data.description,
            type: data.type
          }
        })
      },
      fail (err, xhr) {
        let msg = 'Error retrieving tasks from the Marketplace.'
        bootbox.alert(msg)
        return next(new Error(msg))
      }
    })
  },
  getRecipe (id) {
    return new Promise((resolve, reject) => {
      XHR.send({
        method: 'GET',
        url: `${App.config.marketplace_api.url}/task/${id}/serialize?mode=shallow`,
        authorization: `Bearer ${App.config.marketplace_api.bearer}`,
        done (recipe) {
          resolve(recipe)
        },
        fail (err) {
          reject(err)
        }
      })
    })
  }
}
