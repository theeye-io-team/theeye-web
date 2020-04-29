'use strict'

import App from 'ampersand-app'
import AmpersandState from 'ampersand-state'
import XHR from 'lib/xhr'
import localforage from 'localforage'
import SessionActions from 'actions/session'
import checkLicense from 'app/license'

module.exports = AmpersandState.extend({
  props: {
    last_access: ['number', false],
    access_token: ['string', false],
    //accountPreferences: ['object', false, () => ({
    //  showAccountActions: true,
    //  showMembersTab: true
    //})]
  },
  session: {
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
 // why this prop name is camelcase when all other properties are underscore separated? why !!
    licenseExpired: ['boolean', true, false]
  },
  appInit () {
    this.storage = localforage.createInstance({
      name: 'theeye',
      storeName: 'session'
    })

    this.customer.on('change:name', checkLicense)
    this.on('change:logged_in', checkLicense)

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
      if (next) { next() }
    }

    SessionActions.verifyAccessToken(token, (err) => {
      if (err) {
        XHR.authorization = this.authorization = ''
        this.logged_in = false
        done()
      } else {
        XHR.authorization = this.authorization = `Bearer ${token}`
        if (!this.logged_in) { // valid access token
          // try to login by fetching the profile with the access_token
          SessionActions.fetchProfile(done)
        } else {
          done()
        }
      }
    })
  },
  restoreFromStorage (next) {
    this.storage
      .getItem('session')
      .then(data => {
        data || (data={})
        if (!data.access_token) { data.access_token = null }
        this.set(data, { silent: true })
        next()
      })
  },
  clear () {
    this.unset('access_token') // this triggers session unset
    //this.unset('accountPreferences')
    // mantein user & customer references
    this.user.customers.reset()
    this.user.clear()
    this.customer.clear()
  },
  /**
   * @param {Object} data
   * @property {String} data.access_token
   */
  persist (data) {
    this.last_access = Date.now()
    if (data) this.set(data)

    this.storage
      .setItem('session', this.toJSON())
      .catch(err => console.error('ERROR %j', err))
  },
  //destroy (done) {
  //  done || (done = ()=>{})
  //  this.clear()
  //  //this.persist()
  //  return done()
  //}
})
