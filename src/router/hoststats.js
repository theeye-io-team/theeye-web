import StatsView from 'view/page/host-stats'
import App from 'ampersand-app'
import Route from 'lib/router-route'
import HostActions from 'actions/host'

import config from 'config'

class HostStats extends Route {
  indexRoute (options) {
    let page
    let topics = {
      query: {
        topics: ['host-stats','host-processes']
      }
    }

    this.listenToAndRun(App.state,'change:currentPage', () => {
      if (!page) return
      if (App.state.currentPage == page) {
        App.sockets.subscribe(topics)
      } else {
        App.sockets.unsubscribe(topics)
      }
    })

    fetchHostData(options.id)

    page = new StatsView({
      hostId: options.id,
      host: App.state.hoststatsPage.host,
      resource: App.state.hoststatsPage.resource
    })

    return page
  }
}

const fetchHostData = (host_id) => {
  App.state.hosts.fetch({
    success () {
      let host = App.state.hosts.get(host_id)
      if (!host) return 

      HostActions.fetchIntegrations(host.id)
      //App.state.hoststatsPage.host = host

      let statsHost = App.state.hoststatsPage.host
      statsHost.listenToAndRun(
        host,
        'change',
        () => {
          statsHost.set( host.serialize() )
        }
      )
    }
  })

  App.state.hoststatsPage.resource.clear()
  App.state.hoststatsPage.host.clear()
  App.state.hoststatsPage.dstat = {}
  App.state.hoststatsPage.psaux = {}
  App.state.hoststatsPage.resource
    .fetch({
      data: {
        where: {
          host_id: host_id,
          type: 'host',
          enable: true
        },
        limit: 1
      },
      // somehow this fetch doesn't set the model, so force it on success
      success: function (model, data, response) {
        App.state.hoststatsPage.resource.set(data[0], {parse: true})
        App.state.resources.add( App.state.hoststatsPage.resource )
      }
    })

  window
    .fetch(`${config.api_url}/host/${host_id}/stats`, {
      headers: {
        Authorization: App.state.session.authorization
      },
      credentials: 'omit'
    })
    .then(res => res.json())
    .then(data => {
      if (!data || (Array.isArray(data) && data.length===0)) return
      if (data.error) return
      App.state.hoststatsPage.dstat = data.find(d => d.type == 'dstat') || {}
      App.state.hoststatsPage.psaux = data.find(d => d.type == 'psaux') || {}
    })
}

module.exports = HostStats
