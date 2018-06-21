import App from 'ampersand-app'
import fetch from 'isomorphic-fetch'
import config from 'config'

const swallow = () => {
  App.state.session.licenseExpired = false
}
module.exports = () => {
  const customerName = App.state.session.customer.name
  const loggedIn = App.state.session.logged_in

  // when no session, no customer. Cancel check.
  if (!loggedIn || !customerName) return

  const licenseServiceUri = config.lc_url
  const url = `${licenseServiceUri}?client=${customerName}`

  const fetchOptions = {
    headers: new window.Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }),
    mode: 'cors'
  }
  return fetch(url, fetchOptions)
    .catch(err => swallow(err))
    .then(res => res.json())
    .then(json => {
      if (json && json.endLicense) {
        const expired = new Date() > new Date(json.endLicense)
        App.state.session.licenseExpired = expired
      } else {
        App.state.session.licenseExpired = false
      }
    })
    .catch(err => swallow(err))
}
