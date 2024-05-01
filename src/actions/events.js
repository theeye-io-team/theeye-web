import App from 'ampersand-app'
import XHR from 'lib/xhr'
export default {
  async fetchEmitters (type) {
    App.state.loader.visible = true

    const urlRoot = `${App.config.supervisor_api_url}/event/emitters?type=${type}`

    try {
      const { response } = await XHR.sendPromise({
        url: `${urlRoot}`,
        method: 'GET',
        headers: {
          Accept: 'application/json;charset=UTF-8'
        }
      })
      App.state.loader.visible = false
    } catch (err) {
      App.state.alerts.danger('sorry', 'failed to fetch event emitters')
      App.state.loader.visible = false
    }

  }
}
