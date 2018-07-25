import App from 'ampersand-app'
import XHR from 'lib/xhr'
const config = require('config')

export const startBot = () => {
  XHR.send({
    url: `${config.app_url}/customer/autobot`,
    method: 'POST',
    done: (response, xhr) => {
      console.log('success')
    },
    fail: (err,xhr) => {
      console.log('failure')
    }
  })
}
