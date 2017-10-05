'use strict'

import App from 'ampersand-app'
import XHR from 'lib/xhr'
import bootbox from 'bootbox'
import assign from 'lodash/assign'
import config from 'config'

const xhr = $.ajax

module.exports = {
  login (data) {
    XHR.send({
      url: `${config.app_url}/auth/login`,
      method: 'post',
      jsonData: data,
      timeout: 5000,
      withCredentials: true,
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done: (response,xhr) => {
        if (xhr.status == 200){
          App.state.session.set({
            access_token: response.access_token
          })
        } else {
          bootbox.alert('Login error, please try again')
        }
      },
      fail: (err,xhr) => {
        if (xhr.status == 400) {
          bootbox.alert('Login error, invalid credentials')
        } else {
          bootbox.alert('Login error, please try again')
        }
      }
    })
  },
  logout () {
    XHR.send({
      url: `${config.app_url}/logout`,
      method: 'get',
      timeout: 5000,
      withCredentials: true,
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done: (response,xhr) => {
        if (xhr.status == 200) {
        }
      },
      fail: (err,xhr) => {
        //bootbox.alert('Something goes wrong.')
      }
    })

    App.state.reset() // reset all application states
    App.state.session.clear() // force session destroy on client
    App.state.alerts.success('Logged Out.','See you soon')
  },
  resetMail (data) {
    App.state.loader.visible = true
    XHR.send({
      url: `${config.app_url}/password/resetmail`,
      method: 'post',
      jsonData: data,
      timeout: 5000,
      withCredentials: true,
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done: (response,xhr) => {
        App.state.loader.visible = false
        if (xhr.status == 200){
          bootbox.alert({
            message: 'Password reset link sent',
            callback: () => {
              App.state.login.showRecoverForm = !App.state.login.showRecoverForm
           }
          })
        } else {
            bootbox.alert('Error, please try again')
        }
      },
      fail: (err,xhr) => {
        App.state.loader.visible = false
        if (xhr.status == 400) {
          bootbox.alert('User email not found')
        } else {
          bootbox.alert('Error, please try again')
        }
      }
    })
  },
  register (data) {
    App.state.loader.visible = true

    var body = {}
    body.email = data.email
    body.username = data.email

    const req = xhr({
      url: `${config.app_url}/registeruser`,
      type: 'POST',
      data: JSON.stringify(body),
      dataType: 'json',
      contentType: 'application/json; charset=utf-8',
    })

    req.done(function(){
      App.state.loader.visible = false
      App.state.register.result = true
    })
    req.fail(function(jqXHR, textStatus, errorThrown){
      App.state.loader.visible = false
      var msg = jqXHR.responseText || 'An error has ocurred, please try again later.'
      bootbox.alert({
        title: 'Registration error',
        message: msg
      })
    })
  },
  checkUsernameActivation (username, token) {
    XHR.send({
      url: `${config.app_url}/checkusernameactivation?token=` + encodeURIComponent(token) + '&username=' + encodeURIComponent(username),
      method: 'get',
      done: (response,xhr) => {
        if (xhr.status !== 201) {
          bootbox.alert('Account activation error, please try again later.')
          App.state.activate.finalStep = false
        } else {
          App.state.activate.username = username
          App.state.activate.finalStep = true
        }
      },
      fail: (err,xhr) => {
        if (xhr.status == 400) {
          bootbox.alert('Username already in use.')
          App.state.activate.finalStep = false
        } else if (xhr.status !== 201) {
          bootbox.alert('Account activation error, please try again later.')
          App.state.activate.finalStep = false
        }
      }
    })
  },
  activateStep (data, token) {
    App.state.loader.visible = true
    var token = encodeURIComponent(token);

    XHR.send({
      url: `${config.app_url}/auth/activateuser?token=${token}`,
      method: 'post',
      jsonData: data,
      timeout: 5000,
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done (response,xhr) {
        App.state.loader.visible = false
        if (xhr.status == 200) {
          bootbox.alert({
            message: 'Registration is completed',
            callback: () => {
              App.state.session.set({
                access_token: response.access_token
              })
              // App.navigate('dashboard')
            }
          })
        } else {
          bootbox.alert({
            message: 'Error, please try again',
            callback: () => {
            }
          })
        }
      },
      fail (err,xhr) {
        App.state.loader.visible = false
        if (xhr.status == 400) {
          bootbox.alert({
            message: xhr.response.body.error || 'Error, please try again',
            callback: () => {
            }
          })
        } else {
          bootbox.alert({
            message: 'Error, please try again',
            callback: () => {
            }
          })
        }
      }
    })
  },
  toggleLoginForm() {
    App.state.login.toggle('showRecoverForm')
  },
  providerLogin(provider) {
    window.location.replace('auth/'+provider)
  }
}
