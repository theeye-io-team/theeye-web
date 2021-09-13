import App from 'ampersand-app'
import XHR from 'lib/xhr'

export default {
  startBot () {
    App.state.loader.visible = true
    XHR.send({
      url: `${App.config.api_url}/bot/launcher`,
      method: 'POST',
      done: (response, xhr) => {
        console.log('success')
      },
      fail: (err,xhr) => {
        App.state.loader.visible = false
        console.log('failure')
      }
    })
  }
}
