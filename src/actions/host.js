import App from 'ampersand-app'
import * as LifecycleConstants from 'constants/lifecycle'
import XHR from 'lib/xhr'

export default {
  stats (id) {
    // window.location = '/hoststats/' + id
    App.navigate('/admin/hoststats/' + id)
  },
  applyStateUpdate (id, data) {
    let host = App.state.hosts.get(id)

    if (!host) {
      console.warn('host not found %s', id)
      return
    }

    host.set(data)
  },
  /**
   *
   * @param {String} host_id
   *
   */
  fetchIntegrations (host_id) {
    let host = App.state.hosts.get(host_id)
    let integrations = host.integrations
    if (integrations.ngrok.last_job_id) {
      integrations.ngrok.last_job.id = integrations.ngrok.last_job_id
      integrations.ngrok.last_job.fetch({
        success: () => {
        },
        error: () => {
          integrations.ngrok.last_job.clear()
        }
      })
    }
  },
  applyIntegrationJobStateUpdates (jobData) {
    if (jobData._type == 'NgrokIntegrationJob') {
      if (/hoststats/.test(window.location.pathname)) { // currently navigating host stats
        if (jobData.host_id == App.state.hoststatsPage.host.id) {
          let host = App.state.hosts.get(jobData.host_id)
          host.integrations.ngrok.last_job.set( jobData )
          if (jobData.lifecycle == LifecycleConstants.FINISHED) {
            if (!jobData.result) {
              host.integrations.ngrok.last_job.result.clear()
            }
          }
        }
      }
    }
  },
  reconfigure (id) {
    const host = App.state.hosts.get(id)
    XHR.send({
      method: 'PUT',
      url: `${host.url()}/reconfigure`,
      done (response) {
        App.state.alerts.success('Configuration update in progress')
      },
      fail (err, xhr) {
        App.state.alerts.danger('Cannot fulfill your request now')
      }
    })
  }
}
