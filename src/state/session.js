import AmpersandState from 'ampersand-state'
import XHR from 'lib/xhr'
import Cookies from 'js-cookie'
import after from 'lodash/after'

import { Model as User } from 'models/user'
import { Model as Customer } from 'models/customer'

const log = require('debug')('eye:state:session')

const publicpaths = ['/login', '/activate', '/register']

export default AmpersandState.extend({
  props: {
    ready: 'boolean'
  },
  children: {
    customer: Customer,
    user: User
  },
  initialize () {
    // hack until full SPA compatibility
    if ( publicpaths.indexOf(window.location.pathname) !== -1 ) {
      this.ready = true
      return
    }

    const uid = Cookies.getJSON('theeye').user
    const ready = after(2, () => { this.ready = true })

    XHR({
      method: 'get',
      url: '/myprofile',
      withCredentials: true,
      done: (user) => {
        log('user data fetch success')
        this.user.set(user)

        if (user.theeye.profile.customers) {
          this.user.customers.set(user.theeye.profile.customers)
        }

        ready()
      },
      fail: (err,xhr) => {
        log('user data fetch failure')
        console.err(err)
      }
    })

    XHR({
      method: 'get',
      url: '/api/customer',
      withCredentials: true,
      done: (customer) => {
        log('customer data fetch success')
        this.customer.set(customer)
        ready()
      },
      fail: (err,xhr) => {
        log('customer data fetch failure')
        console.err(err)
      }
    })
  }
})
