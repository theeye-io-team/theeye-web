import App from 'ampersand-app'
import XHR from 'lib/xhr'
const config = require('config')

export const startBot = () => {
  App.state.loader.visible = true
  XHR.send({
    url: `${config.app_url}/customer/autobot`,
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
