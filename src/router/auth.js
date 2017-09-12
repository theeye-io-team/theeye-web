'use strict'

import LoginPageView from 'view/page/login'
import RegisterPageView from 'view/page/register'
import ActivatePageView from 'view/page/activate'
import ActivateOwnerPageView from 'view/page/activate-owner'
import Cookies from 'js-cookie'
import App from 'ampersand-app'

function Route () {
}

Route.prototype = {
  login () {
    const selector = 'body .main-container [data-hook=page-container]'
    const container = document.querySelector(selector)

    App.currentPage = new LoginPageView({ el: container })
  },
  register () {
    const selector = 'body .main-container [data-hook=page-container]'
    const container = document.querySelector(selector)

    App.currentPage = new RegisterPageView({ el: container })
  },
  activate () {
    const selector = 'body .main-container [data-hook=page-container]'
    const container = document.querySelector(selector)
    var cookie = Cookies.getJSON('activate');

    App.state.activate.username = cookie.user.username;
    App.state.activate.email = cookie.user.email;
    App.state.activate.invitation_token = cookie.user.invitation_token;

    if(cookie.user.credential == 'owner') {
      App.currentPage = new ActivateOwnerPageView({ el: container, token: cookie.token})
    } else {
      App.currentPage = new ActivatePageView({ el: container, token: cookie.token})
    }
  }
}

module.exports = Route
