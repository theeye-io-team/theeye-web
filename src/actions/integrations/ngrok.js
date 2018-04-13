import App from 'ampersand-app'
import XHR from 'lib/xhr'
import config from 'config'

export default {
  startTunnel (host_id) {
    let ngrok = App.state.session.customer.config.ngrok
    if (ngrok.enabled !== true) return
    let host = App.state.hosts.get({ id: host_id })

    // start tunnel
    XHR.send({
      url: `${config.api_v3_url}/integrations/ngrok/start`,
      method: 'PUT',
      jsonData: { host: host_id },
      done: (jobData, xhr) => {
        host.integrations.ngrok.last_job.set(jobData)
      },
      fail: (err,xhr) => {
        console.log(err)
        console.log(xhr)
      }
    })
  },
  stopTunnel (host_id) {
    let ngrok = App.state.session.customer.config.ngrok
    if (ngrok.enabled !== true) return
    let host = App.state.hosts.get({ id: host_id })

    // start tunnel
    XHR.send({
      url: `${config.api_v3_url}/integrations/ngrok/stop`,
      method: 'PUT',
      jsonData: { host: host_id },
      done: (jobData, xhr) => {
        host.integrations.ngrok.last_job.set( jobData )
      },
      fail: (err,xhr) => {
        console.log(err)
        console.log(xhr)
      }
    })
  },
}
