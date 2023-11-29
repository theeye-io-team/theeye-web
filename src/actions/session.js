import App from 'ampersand-app'
import XHR from 'lib/xhr'
import loggerModule from 'lib/logger'; const logger = loggerModule('actions:session')
import bootbox from 'bootbox'

const actions = {
  logoutNavigate () {
    if (App.state.session.landing_url) {
      window.location.href = App.state.session.landing_url
    } else {
      App.Router.redirectTo('login', {replace: true})
    }
  },

  logout () {
    // disconnect socket first.
    App.sockets.disconnect()

    // destroy the session, server side
    const request = XHR.send({
      url: `${App.config.app_url}/api/session/logout`,
      method: 'get',
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done: () => {
        // destroy the session, client side
        App.state.alerts.success('Logged Out.','See you soon')

        this.destroyClientSession()
      }
    })
  },

  destroyClientSession () {
    // reset the application state
    App.state.reset()

    // force session destroy
    App.state.session
      .clear(/** silent **/true)
      .then(() => {
        // unset and trigger logged_in events flow
        App.state.session.set('logged_in', false)
      })
  },

  changeCustomer (id) {
    const customer = App.state.session.customers.get(id)
    if (customer.id === App.state.session.customer.id) {
      return
    }

    /**
     * @summary replace current session customer
     */
    const sessionReload = (access_token) => {
      const session = App.state.session
      session.access_token = access_token
      session.customer.clear()
      actions.fetchProfile(() => {
        App.state.reset()
        App.Router.reload()
        App.sockets.connect({ access_token: session.access_token })
      })
    }

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
            sessionReload(response.access_token)
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
        done (data, xhr) {
          const session = App.state.session
          session.access_token = data.access_token

          // reconnection
          App.sockets.once('disconnected', () => {
            setTimeout(() => {
              App.sockets.connect({ access_token: session.access_token })
            }, 500)
          })
          App.sockets.disconnect()

          resolve()
        },
        fail (err, xhr) {
          logger.log('session refresh failure')
          sessionEnd()
          reject(err)
        }
      })
    })
  },
  fetchProfile (next) {
    XHR.send({
      method: 'get',
      url: `${App.config.api_url}/session/profile`,
      done: (profile) => {
        logger.log('user profile data fetch success')
        sessionReset(profile)
        next()
      },
      fail: (err, xhr) => {
        logger.log('user profile data fetch failure')
        sessionEnd()
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
          App.state.alerts.success('Integration settings updated')
          const config = Object.assign(
            {},
            App.state.session.customer.config,
            response
          )
          App.state.session.customer.config = config
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

const sessionReset = (profile) => {
  if (!profile) { return }

  logger.log('updating session')
  const sessionState = App.state.session

  const customer = new App.Models.Customer.Model(profile.current_customer, { parse: true })
  sessionState.customer.set( customer.serialize() ) // update current customer
  sessionState.user.set(profile) // update user profile
  sessionState.member_id = profile.member_id
  sessionState.logged_in = true
  sessionState.protocol = profile.protocol

  // udpate customers list
  const customers = profile.customers
  if (customers) {
    sessionState.customers.reset(customers)
    //sessionState.customers.set()
  }
}

const sessionEnd = () => {
  const sessionState = App.state.session
  sessionState.set('logged_in', false)
  sessionState.unset('access_token')
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
