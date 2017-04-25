'use strict'

//const App = require('ampersand-app')
const Router = require('ampersand-router')
//var qs = require('qs');
const UserRoute = require('./user')
const WebhookRoute = require('./webhook')
const TemplateRoute = require('./template')

module.exports = Router.extend({
  routes: {
    'admin/template(/:id/:action)': () => {
      new TemplateRoute().route()
    },
    'admin/user(/:id/:action)': () => {
      new UserRoute().route()
    },
    'admin/webhook(/:id/:action)': () => {
      new WebhookRoute().route()
    }
  }
})
