import App from 'ampersand-app'
import fetch from 'isomorphic-fetch'
import config from 'config'
import bootbox from 'bootbox'

const swallow = () => {
  App.state.session.licenseExpired = false
}


const checkLicense = () => {
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

const setEnterprise = (customerName) => {
  if (!customerName) return

  window.localStorage.setItem('enterpriseCustomer', customerName)

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
    .catch(err => {
      App.config = Object.assign({}, config)
      bootbox.alert('Enterprise account not found, please try again.')
    })
    .then(res => res.json())
    .then(json => {
      if (json && json.ip) {
        App.config.app_url = json.ip
        App.config.api_url = `${json.ip}/api`
        App.config.api_v3_url = `${json.ip}/api`
        App.config.socket_url = `${json.ip}`

        App.state.enterprise.showEnterpriseForm = false
      } else {
        throw new Error('Enterprise ip not found.')
      }
    })
    .catch(err => {
      App.config = Object.assign({}, config)
      bootbox.alert('Enterprise account not found, please try again.')
    })
  }


export { checkLicense, setEnterprise }
