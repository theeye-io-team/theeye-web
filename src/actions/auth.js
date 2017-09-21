'use strict'

import App from 'ampersand-app'
import XHR from 'lib/xhr'
import bootbox from 'bootbox'
import assign from 'lodash/assign'

const xhr = $.ajax

export default {
  login (data) {
    XHR({
      url: `/auth/locallogin`,
      method: 'post',
      jsonData: data,
      timeout: 5000,
      withCredentials: true,
      headers: {
        Accepts: 'application/json;charset=UTF-8'
      },
      done (response,xhr) {
        if (xhr.status == 200){
          window.location.replace('/events')
        }
        else {
          if (xhr.status == 400) {
            bootbox.alert('Login error, invalid credentials')
          } else {
            bootbox.alert('Login error, please try again')
          }
        }
      },
      fail (err,xhr) {
        bootbox.alert('Login error, please try again')
      }
    })
  },
  resetMail (data) {
    App.state.loader.visible = true
    XHR({
      url: `/password/resetmail`,
      method: 'post',
      jsonData: data,
      timeout: 5000,
      withCredentials: true,
      headers: {
        Accepts: 'application/json;charset=UTF-8'
      },
      done (response,xhr) {
        App.state.loader.visible = false
        if (xhr.status == 200){
          bootbox.alert({
            message: 'Password reset link sent',
            callback: () => {
              window.location.reload()
            }
          })
        }
        else {
          if (xhr.status == 400) {
            bootbox.alert('User email not found')
          } else {
            bootbox.alert('Error, please try again')
          }
        }
      },
      fail (err,xhr) {
        App.state.loader.visible = false
        bootbox.alert('Error, please try again')
      }
    })
  },
  register (data) {
    App.state.loader.visible = true

    var body = {}
    body.email = data.email
    body.username = data.email

    const req = xhr({
      url: '/registeruser',
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
    XHR({
      url: '/checkusernameactivation?token='+encodeURIComponent(token)+'&username='+encodeURIComponent(username),
      method: 'get',
      done (response,xhr) {
        if (xhr.status == 400) {
          bootbox.alert('Username already in use.')
          App.state.activate.finalStep = false
        } else if (xhr.status !== 201) {
          bootbox.alert('Account activation error, please try again later.')
          App.state.activate.finalStep = false
        } else {
          App.state.activate.username = username
          App.state.activate.finalStep = true
        }
      },
      fail (err,xhr) {
        bootbox.alert('Account activation error, please try again later.')
        App.state.activate.finalStep = false
      }
    })
  },
  activateStep (data, token) {
    App.state.loader.visible = true
    var token = encodeURIComponent(token);

    XHR({
      url: '/auth/activateuser?token='+token,
      method: 'post',
      jsonData: data,
      timeout: 5000,
      headers: {
        Accepts: 'application/json;charset=UTF-8'
      },
      done (response,xhr) {
        if (xhr.status == 200) {
          bootbox.alert({
            message: 'Registration complete',
            callback: () => {
              window.location.replace('/dashboard')
            }
          })
        } else if (response.statusCode == 400) {
          bootbox.alert({
            message: response.body.error,
            callback: () => {
              App.state.loader.visible = false
            }
          })
        }
        else {
          bootbox.alert({
            message: 'Error, please try again',
            callback: () => {
              window.location.reload()
            }
          })
        }
      },
      fail (err,xhr) {
        bootbox.alert({
          message: 'Error, please try again',
          callback: () => {
            App.state.loader.visible = false
          }
        })
      }
    })
  }
}
