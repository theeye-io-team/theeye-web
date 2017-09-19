'use strict'

const Router = require('ampersand-router')
const AuthRoute = require('./auth')
const UserRoute = require('./user')
const CustomerRoute = require('./customer')
const WebhookRoute = require('./webhook')
const HostGroupRoute = require('./hostgroup')
import SchedulerRoute from './scheduler'
import DashboardRoute from './dashboard'

module.exports = Router.extend({
  routes: {
    'admin/hostgroup(/:id/:action)': () => {
      new HostGroupRoute().route()
    },
    'admin/user(/:id/:action)': () => {
      new UserRoute().route()
    },
    'admin/customer(/:id/:action)': () => {
      new CustomerRoute().route()
    },
    'admin/webhook(/:id/:action)': () => {
      new WebhookRoute().route()
    },
    'admin/scheduler': () => {
      new SchedulerRoute().route()
    },
    'login': () => {
      new AuthRoute().login()
    },
    'register': () => {
      new AuthRoute().register()
    },
    'activate': () => {
      new AuthRoute().activate()
    },
    'dashboard': () => {
      new DashboardRoute().route()
    }
  }
})
