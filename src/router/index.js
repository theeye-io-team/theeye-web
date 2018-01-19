'use strict'

import App from 'ampersand-app'
import Router from 'ampersand-router'
import AuthActions from 'actions/auth'
const logger = require('lib/logger')('router')

// routes
const AuthRoute = require('./auth')
const UserRoute = require('./user')
const CustomerRoute = require('./customer')
const WebhookRoute = require('./webhook')
import DashboardRoute from './dashboard'
import ChartsRoute from './charts'

module.exports = Router.extend({
  execute (callback, args) {
    if (callback) {
      let publicRoute = ['login','register','activate','sociallogin', 'passwordreset'].find(route => {
        let routeRegex = new RegExp(route)
        return (routeRegex.test(window.location.pathname)||routeRegex.test(window.location.hash))
      })

      let logged_in = App.state.session.logged_in
      if (!publicRoute) {
        // navigate to login if we dont have an access_token
        if (logged_in===undefined) {
          return // wait until it is set
        }
        if (logged_in===false) {
          logger.warn('session expired. must login')
          return false
        } else {
          callback.apply(this, args)
        }
      } else {
        if (logged_in===true) {
          return this.redirectTo('dashboard',{replace: true})
        }
        callback.apply(this, args)
      }
    }
  },
  routes: {
    'dashboard': () => {
      const route = new DashboardRoute()
      route.route('index')
    },
    'admin/user': () => {
      const route = new UserRoute()
      route.route('index')
    },
    'admin/customer': () => {
      const route = new CustomerRoute()
      route.route('index')
    },
    'admin/webhook': () => {
      const route = new WebhookRoute()
      route.route('index')
    },
    'admin/hostgroup': () => {
      return import(/* webpackChunkName: "router-hostgroup" */ './hostgroup').then(HostGroupRoute => {
        const route = new HostGroupRoute()
        route.route('index')
      })
    },
    'admin/task': () => {
      return import(/* webpackChunkName: "router-task" */ './task').then(TasksRoute => {
        const route = new TasksRoute()
        route.route('index')
      })
    },
    'admin/file': () => {
      return import(/* webpackChunkName: "router-files" */ './files').then(FilesRoute => {
        const route = new FilesRoute()
        route.route('index')
      })
    },
    'admin/scheduler': () => {
      return import(/* webpackChunkName: "router-scheduler" */ './scheduler').then(SchedulerRoute => {
        const route = new SchedulerRoute()
        route.route('index')
      })
    },
    'admin/charts': () => {
      const route = new ChartsRoute()
      route.route('index')
    },
    'login': () => {
      const route = new AuthRoute()
      route.route('login')
    },
    'logout': () => {
      AuthActions.logout()
    },
    'register': () => {
      const route = new AuthRoute()
      route.route('register')
    },
    'activate': () => {
      const route = new AuthRoute()
      route.activateRoute()
    },
    'sociallogin': () => {
      const route = new AuthRoute()
      route.socialLoginRoute()
    },
    'socialconnect': () => {
      const route = new AuthRoute()
      route.socialConnectRoute()
    },
    'passwordreset': () => {
      const route = new AuthRoute()
      route.passwordResetRoute()
    },
    'admin/hoststats/:id': function (id) {
      return import(/* webpackChunkName: "router-host-stats" */ './host-stats')
        .then(HostStatsRouter => {
          const route = new HostStatsRouter()
          route.route('index', {id: id})
        })
    },
    '(*path)': function () {
      App.navigate('dashboard')
    }
  }
})
