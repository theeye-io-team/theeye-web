'use strict'

const Router = require('ampersand-router')
const UserRoute = require('./user')
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
    'admin/webhook(/:id/:action)': () => {
      new WebhookRoute().route()
    },
    'admin/scheduler': () => {
      new SchedulerRoute().route()
    },
    'dashboard': () => {
      new DashboardRoute().route()
    }
  }
})
