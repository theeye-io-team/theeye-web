import App from 'ampersand-app'
import XHR from 'lib/xhr'
const logger = require('lib/logger')('actions:session')
const config = require('config')
import bootbox from 'bootbox'
import assign from 'lodash/assign'
import reject from 'lodash/reject'

import { Model as Customer } from 'models/customer'

module.exports = {
  changeCustomer (id) {
    const customer = App.state.session.user.customers.get(id)
    if (customer.id==App.state.session.customer.id) return

    App.state.loader.visible = true
    XHR.send({
      method: 'post',
      url: `${config.app_url}/session/customer/${customer.name}`,
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done: (data,xhr) => {
        App.state.loader.visible = false
        App.customerChange(customer)
      },
      fail: (err,xhr) => {
        App.state.loader.visible = false
        bootbox.alert('Operation failed. Please refresh')
        console.error(arguments)
      }
    })
  },
  verifyCustomerChange (customerName) {
    if (App.state.session.customer.name != customerName) {
      let msg = 'Your organization preferences has been changed from another session. Click OK to refresh'
      bootbox.alert(msg, () => {
        App.state.loader.visible = true

        const customer = App.state.session.user.customers.get(customerName, 'name')
        if (!customer) { // error , customer not found in session. need refresh
          window.location.reload()
          return
        }

        if (customer.id != App.state.session.customer.id) {
          App.customerChange(customer)
        }
      })
    }
  },
  refreshAccessToken () {
    logger.debug('obtaining new acccess token..')

    XHR.send({
      method: 'post',
      url: `${config.app_url}/session/refresh`,
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
  fetchProfile (next) {
    next||(next=function(){})
    const sessionState = App.state.session
    XHR.send({
      method: 'get',
      url: `${config.app_url}/session/profile`,
      done: (user) => {
        logger.log('user profile data fetch success')

        logger.log('updating profile')
        let customer = new Customer(user.current_customer,{ parse: true }) 
        sessionState.customer.set( customer.serialize() )
        sessionState.user.set(user)
        const customers = user.theeye.profile.customers
        if (customers) {
          sessionState.user.customers.reset()
          sessionState.user.customers.set(customers)
        }
        sessionState.logged_in = true
        next()
      },
      fail: (err,xhr) => {
        logger.log('user data fetch failure')
        sessionState.access_token = null
        sessionState.logged_in = false
        next(err)
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
  },
  updateSettings (notif, done) {
    const user = App.state.session.user

    var body = {}
    body.notifications = assign({}, user.notifications.serialize(), notif)

    App.state.loader.step()
    XHR.send({
      url: `${config.app_url}/session/profile/settings`,
      method: 'PUT',
      jsonData: body,
      fail: (err) => {
        App.state.loader.visible = false
        bootbox.alert({
          title: `Settings update error`,
          message: err.message || 'Request failed',
          callback: () => {
            if (done) done()
          }
        })
      },
      done: (settings) => {
        user.set(settings)
        // bootbox.alert({
        //   title: 'Settings',
        //   message: `Settings successfully updated`,
        //   callback: () => {
        //     App.state.loader.visible = false
        //     if (done) done()
        //   }
        // })
        App.state.loader.visible = false
        if (done) done()
      }
    })
  },
  toggleExclusionFilter (filter, add) {
    App.state.loader.step()
    const notifications = App.state.session.user.notifications
    const excludes = notifications.desktopExcludes || []

    // remove from filters so it doesn't dupe
    const newSettings = reject(excludes, filter)
    if (add) newSettings.push(filter)

    this.updateSettings({ desktopExcludes: newSettings }, () => {
      App.state.session.user.trigger('change:notifications')
    })
  },
  updateCustomerIntegrations (settings) {
    var id = App.state.session.customer.id
    var data = assign({}, App.state.session.customer.config, settings)
    App.state.loader.visible = true

    XHR.send({
      url: `${config.app_url}/customer/${id}/config`,
      method: 'put',
      jsonData: data,
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done (config, xhr) {
        App.state.loader.visible = false
        if (xhr.status == 200) {
          bootbox.alert('Integrations updated.')
          App.state.session.customer.config = config // || data.config
        } else {
          bootbox.alert('Error updating integrations.')
        }
      },
      fail (err, xhr) {
        App.state.loader.visible = false
        bootbox.alert('Error updating integrations.')
      }
    })
  }
}
