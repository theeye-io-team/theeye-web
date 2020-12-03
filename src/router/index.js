'use strict'

import App from 'ampersand-app'
import Router from 'ampersand-router'
import SessionActions from 'actions/session'
import loggerModule from 'lib/logger'; const logger = loggerModule('router')

// routes
import AuthRoute from './auth'
import UserRoute from './user'
import CustomerRoute from './customer'
import MemberRoute from './member'
import WebhookRoute from './webhook'
import DashboardRoute from './dashboard'
import ChartsRoute from './charts'
import HelpRoute from './help'
import WorkflowRouter from './workflow'
import hopscotch from 'hopscotch'
import config from 'config'

export default Router.extend({
  publicRoutes: [
    'login',
    'sociallogin',
    'register',
    'activate',
    'passwordreset',
    'finishregistration',
    'enterprise'
  ],
  execute (callback, args) {
    if (callback) {
      if (hopscotch.getCurrTour()) {
        hopscotch.endTour(true)
      }

      //let publicRoutes = 

      let isPublicRoute = this.publicRoutes.find(route => {
        let routeRegex = new RegExp(route)
        return (routeRegex.test(window.location.pathname)||routeRegex.test(window.location.hash))
      })

      let logged_in = App.state.session.logged_in
      if (!isPublicRoute) {
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
    'help': () => {
      const route = new HelpRoute()
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
    'admin/member': () => {
      const route = new MemberRoute()
      route.route('index')
    },
    'admin/webhook': () => {
      const route = new WebhookRoute()
      route.route('index')
    },
    'admin/hostgroup': () => {
      return import(/* webpackChunkName: "router-hostgroup" */ './hostgroup')
        .then(({ default: HostGroupRoute }) => {
          const route = new HostGroupRoute()
          route.route('index')
        })
    },
    'admin/task': () => {
      return import(/* webpackChunkName: "router-task" */ './task')
        .then(({ default: TasksRoute }) => {
          const route = new TasksRoute()
          route.route('index')
        })
    },
    'admin/file': () => {
      return import(/* webpackChunkName: "router-files" */ './files')
        .then(({ default: FilesRoute }) => {
          const route = new FilesRoute()
          route.route('index')
        })
    },
    'admin/scheduler': () => {
      return import(/* webpackChunkName: "router-scheduler" */ './scheduler')
        .then(({ default: SchedulerRoute }) => {
          const route = new SchedulerRoute()
          route.route('index')
        })
    },
    'admin/hoststats/:id': function (id) {
      return import(/* webpackChunkName: "router-hoststats" */ './hoststats')
        .then(({ default: HostStatsRouter }) => {
          const route = new HostStatsRouter()
          route.route('index', { id })
        })
    },
    'admin/workflow/:id': (id) => {
      const route = new WorkflowRouter()
      route.route('index', {id: id})
    },
    'admin/charts/:integration': (integration) => {
      const route = new ChartsRoute()
      route.route('index', {integration})
    },
    'login': () => {
      const route = new AuthRoute()
      route.route('login')
    },
    'logout': () => {
      SessionActions.logout()
    },
    'sociallogin': () => {
      const route = new AuthRoute()
      route.socialLoginRoute()
    },
    'socialconnect': () => {
      const route = new AuthRoute()
      route.socialConnectRoute()
    },
    'register': () => {

      if (App.config.components.login.registration.enabled !== true) {
        return App.Router.redirectTo('login',{replace: true})
      }

      const route = new AuthRoute()
      route.route('register')
    },
    'activate': () => {

      if (App.config.components.login.registration.enabled !== true) {
        return App.Router.redirectTo('login',{replace: true})
      }

      const route = new AuthRoute()
      route.activateRoute()
    },
    'finishregistration': () => {

      if (App.config.components.login.registration.enabled !== true) {
        return App.Router.redirectTo('login',{replace: true})
      }

      const route = new AuthRoute()
      route.finishregistrationRoute()
    },
    'passwordreset': () => {

      if (App.config.components.login.password_reset.enabled !== true) {
        return App.Router.redirectTo('login',{replace: true})
      }

      const route = new AuthRoute()
      route.passwordResetRoute()
    },
    'enterprise': () => {

      if (App.config.components.login.enterprise.enabled !== true) {
        return App.Router.redirectTo('login',{replace: true})
      }

      const route = new AuthRoute()
      route.route('enterprise')
    },
    '(*path)': function () {
      App.navigate('dashboard')
    },
  }
})
