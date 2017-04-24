'use strict'

//const App = require('ampersand-app')
const Router = require('ampersand-router')
//var qs = require('qs');
const UserController = require('controller/user')
const WebhookController = require('controller/webhook')

module.exports = Router.extend({
  routes: {
    'admin/user(/:id/:action)': () => {
      new UserController().route()
    },
    'admin/webhook(/:id/:action)': () => {
      new WebhookController().route()
    }
  }
})
