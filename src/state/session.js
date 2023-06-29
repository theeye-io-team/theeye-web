import App from 'ampersand-app'
import AmpersandState from 'ampersand-state'
import XHR from 'lib/xhr'
import localforage from 'localforage'
import { checkLicense } from 'app/license'
import jwtDecode from 'jwt-decode'

export default AmpersandState.extend({
  props: {
    last_access: ['number', false],
    access_token: ['string', false],
    protocol: 'string',
  },
  session: {
    landing_url: 'string',
    member_id: 'string',
    storage: 'object',
    user: ['state', false, () => {
      return new App.Models.User.Model()
    }],
    customer: ['state', false, () => {
      return new App.Models.Customer.Model()
    }],
    logged_in: 'boolean',
    authorization: 'string',
    restored: 'boolean',
    relogin_message: ['boolean',false,false],
 // why this prop name is camelcase when all other properties are underscore separated? why?, why ?!!
    licenseExpired: ['boolean', true, false]
  },
  collections: {
    customers: function (models, options) {
      return new App.Models.Customer.Collection(models, options)
    }
  },
  derived: {
    show_account_actions: {
      deps: ['protocol'],
      fn () {
        if (this.protocol === 'ldap') { return false }
        return true
      }
    }
  },
  appInit () {
    this.storage = localforage.createInstance({
      driver: [ localforage.INDEXEDDB, localforage.WEBSQL ],
      name: 'theeye',
      storeName: 'session'
    })

    this.customer.on('change:name', checkLicense)
    this.on('change:logged_in', checkLicense)

    this.customer.on('change:config', () => {
      const el = this.customer.config.enterprise_login
      if (el?.enabled===true) {
        this.landing_url = el.url
      } else {
        this.landing_url = ''
      }
    })

    this.restoreFromStorage(() => {
      this.verifyAccessToken(() => {
        // once session determines if the current access token is valid or not
        // trigger restored event to continue app initialization
        this.on('change:access_token', (event) => {
          this.verifyAccessToken()
        })
        this.trigger('restored')
      })
    })
  },
  verifyAccessToken (next) {
    const token = this.access_token

    const done = () => {
      this.persist()
      next && next()
    }

    let valid = isValidAccessToken(token)
    if (!valid) {
      XHR.authorization = this.authorization = ''
      this.logged_in = false
      done()
    } else {
      XHR.authorization = this.authorization = `Bearer ${token}`
      if (!this.logged_in) { // valid access token
        // try to login by fetching the profile with the access_token
        App.actions.session.fetchProfile(done)
      } else {
        done()
      }
    }
  },
  restoreFromStorage (next) {
    return this.storage
      .getItem('session')
      .then(data => {
        data || (data={})
        if (!data.access_token) { data.access_token = null }
        this.set(data, { silent: true })
        next(null, data)
      })
      .catch(err => {
        console.error('ERROR %j', err)
        next(err, {})
      })
  },
  clear (silent) {
    this.customers.reset()
    this.user.clear({silent})
    this.customer.clear({silent})
    // session unset events
    this.unset('access_token', {silent})
    this.unset('authorization', {silent})
    this.unset('member_id', {silent})
    //AmpersandState.prototype.clear.call(this, {silent})
    this.persist()
  },
  /**
   * @param {Object} data
   * @property {String} data.access_token
   */
  persist (data) {
    this.last_access = Date.now()
    if (data) {
      this.set(data)
    }

    const {
      last_access,
      access_token,
      protocol
    } = this.serialize()

    this.storage
      .setItem('session', { last_access, access_token, protocol })
      .catch(err => {
        console.error('ERROR %j', err)
      })
  },
})

const isValidAccessToken = (token) => {
  const isValidFormat = Boolean(token)
  if (!isValidFormat) { // empty or not set
    return false
  }

  let decoded = jwtDecode(token)
  let date = new Date()

  if ((decoded.exp * 1000) <= date.getTime()) {
    return false
  }

  return true
}
