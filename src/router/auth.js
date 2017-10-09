'use strict'

import LoginPageView from 'view/page/login'
import RegisterPageView from 'view/page/register'
import ActivatePageView from 'view/page/activate'
import ActivateOwnerPageView from 'view/page/activate-owner'
import Cookies from 'js-cookie'
import App from 'ampersand-app'
import Route from 'lib/router-route'
import search from 'lib/query-params'
import XHR from 'lib/xhr'
import bootbox from 'bootbox'

class Auth extends Route {

  loginRoute () {
    return new LoginPageView()
  }

  registerRoute () {
    return new RegisterPageView()
  }

  activateRoute () {
    const query = search.get()
    let invitation_token = query.invitation_token

    if (!invitation_token) return App.navigate('login')

    XHR.send({
      url: '/verifytoken?invitation_token='+encodeURIComponent(invitation_token),
      method: 'get',
      done (response,xhr) {
        if (xhr.status == 200) {
          App.state.activate.username = response.username;
          App.state.activate.email = response.email;
          App.state.activate.invitation_token = response.invitation_token;
          var page;
          if (response.credential == 'owner') {
            page = new ActivateOwnerPageView({ token: response.invitation_token })
          } else {
            page = new ActivatePageView({ token: response.invitation_token })
          }
          App.state.set('currentPage', page)
        } else {
          App.navigate('login')
        }
      },
      fail (err,xhr) {
        App.navigate('login')
      }
    })
  }

  socialLoginRoute() {
    const query = search.get()
    if(query.error){
      App.navigate('login')
      bootbox.alert(query.error,function(){ })
      return false
    }
    let access_token = query.access_token
    if (!access_token) return App.navigate('login')

    //Add validation
    App.state.session.set({
      access_token: access_token
    })
  }
}

module.exports = Auth
