import StatsView from 'view/page/host-stats'
import App from 'ampersand-app'
import Route from 'lib/router-route'

import config from 'config'

class HostStats extends Route {
  indexRoute (options) {
    App.state.hoststatsPage.resource.clear()
    App.state.hoststatsPage.host.clear()
    App.state.hoststatsPage.dstat = {}
    App.state.hoststatsPage.psaux = {}

    App.state.hosts.fetch({
      success () {
        let host = App.state.hosts.get(options.id)

        fetchIntegrations(host.integrations)

        let statsHost = App.state.hoststatsPage.host
        statsHost.listenToAndRun(host, 'change', () => {
          statsHost.set(host.serialize())
        })
      }
    })

    App.state.hoststatsPage.resource
      .fetch({
        data: {
          where: {
            host_id: options.id,
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
      .fetch(`${config.api_url}/host/${options.id}/stats`, {
        headers: {
          Authorization: App.state.session.authorization
        },
        credentials: 'omit'
      })
      .then(res => res.json())
      .then(data => {
        App.state.hoststatsPage.dstat = data.find(d => d.type === 'dstat')
        App.state.hoststatsPage.psaux = data.find(d => d.type === 'psaux')
      })
    return new StatsView({hostId: options.id})
  }
}

/**
 *
 * @param {Array} integrations
 *
 */
const fetchIntegrations = (integrations) => {
  if (integrations.ngrok.last_job_id) {
    integrations.ngrok.last_job.id = integrations.ngrok.last_job_id
    integrations.ngrok.last_job.fetch()
  }
}

module.exports = HostStats
