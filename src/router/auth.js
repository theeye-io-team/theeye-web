'use strict'

import LoginPageView from 'view/page/login'
import RegisterPageView from 'view/page/register'
import ActivatePageView from 'view/page/activate'
import FinishRegistrationPageView from 'view/page/activate-owner'
import PasswordResetView from 'view/page/password-reset'
import EnterprisePageView from 'view/page/enterprise'
import App from 'ampersand-app'
import Route from 'lib/router-route'
import search from 'lib/query-params'
import XHR from 'lib/xhr'
import bootbox from 'bootbox'
import config from 'config'

class Auth extends Route {
  loginRoute () {
    return new LoginPageView()
  }

  registerRoute () {
    return new RegisterPageView()
  }

  activateRoute () {
    App.actions.auth.verifyInvitationToken(function () {
      App.state.set('currentPage', new ActivatePageView())
    })
  }

  finishregistrationRoute () {
    App.actions.auth.verifyInvitationToken(function () {
      App.state.set('currentPage', new FinishRegistrationPageView())
    })
  }

  tokenLoginRoute () {
    const query = search.get()
    if (query.error) {
      App.navigate('login')
      bootbox.alert(query.error,function(){ })
      return false
    }
    let access_token = query.access_token
    if (!access_token) return App.navigate('login')
    App.state.session.access_token = access_token
  }

  socialConnectRoute () {
    const query = search.get()
    App.navigate('dashboard')
    App.state.settingsMenu.user.visible = true
    if(query.error){
      bootbox.alert(query.error,function(){ })
      return false
    }
    bootbox.alert(query.message,function(){ })
    return false
  }

  passwordResetRoute () {
    const query = search.get()
    let token = query.token
    if (!token) {
      return App.navigate('login')
    }

    XHR.send({
      url: `${App.config.api_url}/auth/password/recoververify?token=` + encodeURIComponent(token),
      method: 'get',
      done (response,xhr) {
        var resetToken = response.resetToken
        App.state.passwordReset.token = resetToken

        var page = new PasswordResetView()
        App.state.set('currentPage', page)
      },
      fail (err,xhr) {
        App.navigate('login')
        bootbox.alert('Password reset link expired.',function(){ })
        return false
      }
    })
  }

  enterpriseRoute () {
    return new EnterprisePageView()
  }
}

export default Auth
