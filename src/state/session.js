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
    authorization: 'string'
  },
  initialize () {
    this.storage = localforage.createInstance({
      name: 'theeye',
      storeName: 'session'
    })

    this.on('change:access_token',() => {
      const token = this.access_token
      const hasValidAccessToken = Boolean(token)

      this.authorization = hasValidAccessToken ? `Bearer ${token}` : ''
      XHR.authorization = this.authorization

      if (!hasValidAccessToken) {
        this.logged_in = false
      } else {
        if (!this.logged_in) {
          SessionActions.fetchProfile()
        }
      }

      // each time the access token changes, persist it's value
      this.persist()
    })

    this.deserialize()
  },
  deserialize () {
    this.storage
      .getItem('session')
      .then( data => {
        data || (data={})

        if (!data.access_token) {
          this.trigger('change:access_token')
        }

        this.set(data)
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
