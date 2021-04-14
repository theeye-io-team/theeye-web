import App from 'ampersand-app'
import XHR from 'lib/xhr'
import loggerModule from 'lib/logger'; const logger = loggerModule('actions:session')
import bootbox from 'bootbox'

const actions = {
  logout () {
    XHR.send({
      url: `${App.config.app_url}/api/session/logout`,
      method: 'get',
      headers: {
        Accept: 'application/json;charset=UTF-8'
      //},
      //done: (response,xhr) => {
      //  if (xhr.status == 200) {
      //  }
      //},
      //fail: (err,xhr) => {
      //  bootbox.alert('Something goes wrong.')
      }
    })

    App.state.reset() // reset all application states
    App.state.session.clear() // force session destroy on client
    App.state.alerts.success('Logged Out.','See you soon')
  },
  changeCustomer (id) {
    const customer = App.state.session.user.customers.get(id)
    if (customer.id === App.state.session.customer.id) { return }

    App.sockets.disconnect(() => {
      App.state.loader.visible = true
      XHR.send({
        method: 'put',
        url: `${App.config.api_url}/session/customer/${customer.id}`,
        headers: {
          Accept: 'application/json;charset=UTF-8'
        },
        done: (response, xhr) => {
          App.state.loader.visible = false
          if (xhr.status === 200) {
            App.state.session.access_token = response.access_token
            sessionReload()
          }
        },
        fail: (err, xhr) => {
          App.state.loader.visible = false
          bootbox.alert('Operation failed. Please refresh')
          console.error(arguments)
        }
      })
    })
  },
  verifyCustomerChange (customerName) {
   if (App.state.session.customer.name != customerName) {
     let msg = 'Your session settings has changed. Click OK to refresh'
     bootbox.alert(msg, () => {
       window.location.reload()
       return
     })
   }
  },
  applyStateUpdate (model, op) {
    console.log(model, op)
    console.log(event)
  },
  refreshAccessToken () {
    logger.debug('obtaining new acccess token..')

    return new Promise( (resolve, reject) => {
      XHR.send({
        method: 'put',
        url: `${App.config.api_url}/session/refresh`,
        headers: {
          Accept: 'application/json;charset=UTF-8'
        },
        done: (data, xhr) => {
          App.state.session.access_token = data.access_token
          resolve()
        },
        fail: (err,xhr) => {
          logger.log('session refresh failure')
          App.state.session.access_token = null
          App.state.session.logged_in = false
          reject(err)
        }
      })
    })
  },
  fetchProfile (next) {
    const sessionState = App.state.session

    const setSession = (profile) => {
      logger.log('updating profile')
      let customer = new App.Models.Customer.Model(profile.current_customer, { parse: true })
      sessionState.customer.set( customer.serialize() )
      sessionState.user.set(profile)
      sessionState.member_id = profile.member_id
      const customers = profile.customers
      if (customers) {
        sessionState.user.customers.reset()
        sessionState.user.customers.set(customers)
      }
      sessionState.logged_in = true
      sessionState.protocol = profile.protocol
    }

    XHR.send({
      method: 'get',
      url: `${App.config.api_url}/session/profile`,
      done: (profile) => {
        logger.log('user profile data fetch success')
        setSession(profile)
        next()
      },
      fail: (err, xhr) => {
        logger.log('user profile data fetch failure')
        sessionState.access_token = null
        sessionState.logged_in = false
        next(err)
      }
    })
  },
  reFetchProfile (next) {
    const sessionState = App.state.session
    XHR.send({
      method: 'get',
      url: `${App.config.api_url}/session/profile`,
      done: (profile) => {
        logger.log('profile data fetch success')
        logger.log('updating profile')
        const customer = new App.Models.Customer.Model(profile.current_customer, { parse: true })
        sessionState.customer.set( customer.serialize() )
        sessionState.user.set(profile)
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
  getPassports () {
    XHR.send({
      url: `${App.config.api_url}/session/passports`,
      method: 'get',
      done: (response, xhr) => {
        if (xhr.status !== 200) {
          bootbox.alert({
            title: 'Error',
            message: 'Error fetching user profile information, please try again later.'
          })
        } else {
          App.state.settingsMenu.user.passports = response
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
  updateNotifications (notif, done) {
    const user = App.state.session.user

    var body = Object.assign({}, user.notifications.serialize(), notif)

    App.state.loader.step()
    XHR.send({
      url: `${App.config.api_url}/session/profile/notifications`,
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
        App.state.loader.visible = false
        if (done) done()
      }
    })
  },
  updateNotificationsFilters (exclude, add) {
    App.state.loader.step()

    const notifications = App.state.session.user.notifications
    const currentExcludes = notifications.notificationFilters || []

    if (add) {
      currentExcludes.push(exclude)
    } else {
      let excludeMap = buildExcludeMap(exclude) // build a map of every filter in exclude
      let index
      let found = currentExcludes.find((elem, idx) => {
        let currExMap = buildExcludeMap(elem)
        if (currExMap === excludeMap) {
          index = idx
          return true
        }
        return false
      })

      currentExcludes.splice(index, 1)
    }

    let payload = { notificationFilters: currentExcludes }
    this.updateNotifications(payload, () => {
      App.state.session.user.trigger('change:notifications')
    })
  },
  updateCustomerIntegrations (data) {
    App.state.loader.visible = true
    XHR.send({
      url: `${App.config.api_url}/customer/config`,
      method: 'put',
      jsonData: data,
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done (response, xhr) {
        App.state.loader.visible = false
        if (xhr.status == 200) {
          bootbox.alert('Integrations updated.')
          App.state.session.customer.config = Object.assign({}, App.state.session.customer.config, response)
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

export default actions

/**
 * @summary replace current session customer
 */
const sessionReload = () => {
  const session = App.state.session
  session.customer.clear()
  actions.reFetchProfile(() => {
    App.state.reset()
    App.Router.reload()
    // reconnect sockets using the new access token
    App.sockets.connect({ access_token: session.access_token })
  })
}

const buildExcludeMap = (exclude) => {
  let excludeMap = []
  for (let prop in exclude) {
    excludeMap.push(
      [
        stringToNumbersKey(prop),         // key
        stringToNumbersKey(exclude[prop]) // value
      ].join('')
    )
  }

  // sort filters map and join. build a single key
  return excludeMap.sort().join('')
}

/**
 * given a string returns a numeric represetation of it in order.
 * so it can be compared later
 */
const stringToNumbersKey = (value) => {
  if (typeof value !== 'string') {
    return buildExcludeMap(value)
  }

  let id = Array.prototype.map
    .call(value, e => e.charCodeAt(0)) // convert every char in number
    .sort() // sort numbers
    .join('') // join to build a long number
  return id
}
