import App from 'ampersand-app'
import fetch from 'isomorphic-fetch'

module.exports = () => {
  const customerName = App.state.session.customer.name
  const accessToken = App.state.session.access_token
  if (!customerName || !accessToken) return

  const fetchOptions = {
    headers: new window.Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    })
  }
  fetch('/session/license', fetchOptions)
    .catch(err => {
      console.warn(err) // network error
    })
    .then(res => {
      if (res.ok) {
        return res.json()
      } else {
        return res.text()
      }
    })
    .then(json => {
      // errors come in text
      if (typeof (json) === 'string') {
        // console.warn(json)
      } else {
        App.state.session.licenseExpired = json.expired
      }
    })
}
