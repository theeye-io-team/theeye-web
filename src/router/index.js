'use strict'

const AmpersandRouter = require('ampersand-router')
const UserRoute = require('./user')
const WebhookRoute = require('./webhook')
const HostGroupRoute = require('./hostgroup')
import SchedulerRoute from './scheduler'
import DashboardRoute from './dashboard'

// https://github.com/AmpersandJS/ampersand-router#execute-routerexecutecallback-args
const Router = AmpersandRouter.extend({
//  execute: function(callback, args) {
//    args.push(parseQueryString(args.pop()));
//    if (callback) callback.apply(this, args);
//  }
})

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
