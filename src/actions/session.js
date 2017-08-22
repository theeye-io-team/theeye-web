import XHR from 'lib/xhr'

module.exports = {
  setCustomer (name) {
    XHR({
      method: 'post',
      url: `/setcustomer/${name}`,
      withCredentials: true,
      timeout: 5000,
      headers: {
        Accepts: 'application/json;charset=UTF-8'
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
