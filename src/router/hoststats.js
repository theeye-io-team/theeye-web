import StatsView from 'view/page/host-stats'
import App from 'ampersand-app'
import Route from 'lib/router-route'

import config from 'config'

class HostStats extends Route {
  indexRoute (options) {
    let page
    let query = {
      topics: ['host-stats','host-processes']
    }

    this.listenToAndRun(App.state, 'change:currentPage', () => {
      if (!page) { return }
      if (App.state.currentPage === page) {
        App.sockets.subscribe(query)
      } else {
        App.sockets.unsubscribe(query)
        this.stopListening(App.state, 'change:currentPage')
      }
    })

    fetchHostData(options.id)

    page = new StatsView({
      hostId: options.id,
      //host: App.state.hoststatsPage.host,
      //resource: App.state.hoststatsPage.resource
    })

    return page
  }
}

const fetchHostData = (host_id) => {
  //App.state.hoststatsPage.resource.clear()
  //App.state.hoststatsPage.host.clear()
  //App.state.hoststatsPage.dstat = {}
  //App.state.hoststatsPage.psaux = {}

  App.state.hoststatsPage.clear()
  App.state.hosts.fetch({
    success () {
      let host = App.state.hosts.get(host_id)
      if (!host) { return }

      App.actions.host.fetchIntegrations(host.id)

      let statsHost = App.state.hoststatsPage.host
      statsHost.set(host.serialize())
      //statsHost.listenTo(host, 'change', () => {
      //  statsHost.set(host.serialize())
      //})

      // host fetch success? continue loading the rest
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
        .fetch(`${statsHost.url()}/stats`, {
          headers: {
            Authorization: App.state.session.authorization
          },
          credentials: 'omit'
        })
        .catch(err => {
          return
        })
        .then(res => res.json())
        .then(data => {
          if (!data || (Array.isArray(data) && data.length===0)) { return }
          if (data.error) { return }

          App.state.hoststatsPage.dstat = (data.find(d => d.type == 'dstat') || {})
          App.state.hoststatsPage.psaux = (data.find(d => d.type == 'psaux') || {})
        })
    }
  })
}

export default HostStats
