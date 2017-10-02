'use strict'

import AmpersandState from 'ampersand-state'
import XHR from 'lib/xhr'
import after from 'lodash/after'
import localforage from 'localforage'

import { Model as User } from 'models/user'
import { Model as Customer } from 'models/customer'

const log = require('debug')('eye:state:session')
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
    logged_in: ['boolean'],
    authorization: ['string',false]
  },
  initialize () {
    this.storage = localforage.createInstance({
      name: 'theeye',
      storeName: 'session'
    })

    this.on('change:access_token',() => {

      if (!this.access_token) {
        XHR.authorization = this.authorization = null
        this.logged_in = false
      } else {
        XHR.authorization = this.authorization = `Bearer ${this.access_token}`
        if (!this.logged_in) {
          this.fetchProfile(err => {
            if (!err) {
              this.logged_in = true
            } else {
              this.logged_in = false
              this.access_token = null
            }
          })
        }
      }

      // each time the access token changes, persist
      this.persist()
    })

    this.deserialize()
  },
  fetchProfile (next) {
    XHR.send({
      method: 'get',
      url: `${config.app_url}/myprofile`,
      withCredentials: true,
      done: (user) => {
        log('user profile data fetch success')

        log('updating profile')
        this.customer.set(user.current_customer)
        this.user.set(user)
        if (user.theeye.profile.customers) {
          this.user.customers.reset()
          this.user.customers.set(user.theeye.profile.customers)
        }

        next()
      },
      fail: (err) => {
        log('user data fetch failure')
        next(err)
      }
    })
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
    this.unset(['access_token'])
    this.logged_in = undefined

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
  destroy (done) {
    done || (done = ()=>{})
    this.clear()
    this.persist()
    return done()
  }
})
