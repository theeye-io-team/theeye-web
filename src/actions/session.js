import App from 'ampersand-app'
import XHR from 'lib/xhr'
const logger = require('lib/logger')('actions:session')
const config = require('config')
import bootbox from 'bootbox'

module.exports = {
  changeCustomer (id) {
    const customer = App.state.session.user.customers.get(id)
    if (customer.id==App.state.session.customer.id) return

    App.state.loader.visible = true
    XHR.send({
      method: 'post',
      url: `${config.app_url}/session/customer/${customer.name}`,
      withCredentials: true,
      timeout: 5000,
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done: (data,xhr) => {
        App.state.loader.visible = false
        // replace current customer
        App.state.session.customer.clear()
        App.state.session.customer.set( customer.serialize() )
        App.state.reset()
        App.Router.reload()
      },
      fail: (err,xhr) => {
        App.state.loader.visible = false
        bootbox.alert('Operation failed. Please refresh')
        console.error(arguments)
      }
    })
  },
  refreshAccessToken () {
    logger.debug('obtaining new acccess token..')

    XHR.send({
      method: 'post',
      url: `${config.app_url}/session/refresh`,
      withCredentials: true,
      timeout: 5000,
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done: (data,xhr) => {
        App.state.session.access_token = data.access_token
        //App.state.session.set({
        //  access_token: data.access_token
        //},{ silent: true })
      },
      fail: (err,xhr) => {
      }
    })
  },
  fetchProfile () {
    const sessionState = App.state.session
    XHR.send({
      method: 'get',
      url: `${config.app_url}/session/profile`,
      withCredentials: true,
      done: (user) => {
        logger.log('user profile data fetch success')

        logger.log('updating profile')
        sessionState.customer.set(user.current_customer)
        sessionState.user.set(user)
        const customers = user.theeye.profile.customers
        if (customers) {
          sessionState.user.customers.reset()
          sessionState.user.customers.set(customers)
        }
        sessionState.logged_in = true
      },
      fail: (err) => {
        logger.log('user data fetch failure')
        sessionState.logged_in = false
        sessionState.access_token = null
      }
    })
  },
  getUserPassport() {
    XHR.send({
      url: `${config.app_url}/userpassport`,
      method: 'get',
      done: (response,xhr) => {
        if (xhr.status !== 200) {
          bootbox.alert({
            title: 'Error',
            message: 'Error fetching user profile information, please try again later.'
          })
        } else {
          App.state.navbar.settingsMenu.passports = response
        }
      },
      fail: (err,xhr) => {
        bootbox.alert({
          title: 'Error',
          message: 'Error fetching user profile information, please try again later.'
        })
      }
    })
  }
}
