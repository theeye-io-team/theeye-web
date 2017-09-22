import XHR from 'lib/xhr'
const config = require('config')

module.exports = {
  setCustomer (name) {
    XHR.send({
      method: 'post',
      url: `${config.app_url}/setcustomer/${name}`,
      withCredentials: true,
      timeout: 5000,
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done (data,xhr) {
        window.location.reload()
      },
      fail (err,xhr) {
        bootbox.alert('Operation failed. Please refresh')
        console.log(arguments)
      }
    })
  }
}
