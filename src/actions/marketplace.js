import App from 'ampersand-app'
import XHR from 'lib/xhr'
import MarketplaceView from 'view/marketplace'

export default {
  hide () {
    App.state.marketplace.menu.visible = false
  },
  show () {
    const state = App.state.marketplace.menu
    state.current_tab = state.default_tab
    state.visible = true 

    const view = new MarketplaceView()
    view.render()
  },
  toggle () {
    App.state.marketplace.menu.toggle('visible')
  },
  toggleTab (tabId) {
    App.state.marketplace.menu.current_tab = tabId
  },
  tasks: {
    fetch () {
      XHR.send({
        method: 'GET',
        url: `${App.config.marketplace_api.url}/task?unassigned=true`,
        authorization: `Bearer ${App.config.marketplace_api.bearer}`,
        done (tasks) {
          App.state.marketplace.tasks.list = tasks.map(task => { 
            return {
              name: task.name,
              id: task.id,
              description: task.description,
              type: task.type
            }
          })
          App.state.marketplace.tasks.fetched = true
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
}
