'use strict'

import AmpersandState from 'ampersand-state'
import XHR from 'lib/xhr'
import after from 'lodash/after'
import localforage from 'localforage'
import SessionActions from 'actions/session'

import { Model as User } from 'models/user'
import { Model as Customer } from 'models/customer'

import config from 'config'

//const publicpaths = ['/login','/activate','/register']

module.exports = AmpersandState.extend({
  props: {
    last_access: ['number', false],
    access_token: ['string', false],
  },
  session: {
    storage: 'object',
    user: ['state',false,() => { return new User() }],
    customer: ['state',false,() => { return new Customer() }],
    logged_in: 'boolean',
    authorization: 'string',
    restored: 'boolean',
    relogin_message: ['boolean',false,false]
  },
  appInit () {
    this.storage = localforage.createInstance({
      name: 'theeye',
      storeName: 'session'
    })

    this.restoreFromStorage( () => {
      // once session determines if the current access token is valid or not
      // trigger restored event to continue app initialization
      this.on('change:access_token',(event) => { this.validateAccessToken() })
      this.trigger('restored')
    })
  },
  validateAccessToken (next) {
    const token = this.access_token
    const isValidFormat = Boolean(token)
    this.authorization = isValidFormat ? `Bearer ${token}` : ''
    XHR.authorization = this.authorization

    const done = () => {
      this.persist()
      if (next) next()
    }

    if (!isValidFormat) { // empty or not set
      this.logged_in = false
      done()
    } else {
      if (!this.logged_in) { // valid access token
        // try to login by fetching the profile with the access_token
        SessionActions.fetchProfile(done)
      }
    }
  },
  restoreFromStorage (next) {
    this.storage
      .getItem('session')
      .then(data => {
        data || (data={})

        if (!data.access_token) {
          data.access_token = null
        }

        this.set(data,{ silent: true })
        this.validateAccessToken(next)
      })
  },
  clear () {
    this.unset('access_token') // this triggers session unset
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
      .catch(err => debug('ERROR %j', err))
  },
  //destroy (done) {
  //  done || (done = ()=>{})
  //  this.clear()
  //  //this.persist()
  //  return done()
  //}
})
