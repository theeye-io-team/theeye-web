'use strict'

//const App = require('ampersand-app')
const Router = require('ampersand-router')
//var qs = require('qs');
const UserRoute = require('./user')
const WebhookRoute = require('./webhook')
const HostGroupRoute = require('./hostgroup')
import SchedulerRoute from './scheduler'

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
    }
  }
})
