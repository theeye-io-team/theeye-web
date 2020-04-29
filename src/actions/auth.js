'use strict'

import App from 'ampersand-app'
import XHR from 'lib/xhr'
import bootbox from 'bootbox'
import assign from 'lodash/assign'
import config from 'config'
import registerLang from 'language/register'
import activationLang from 'language/activation'

const xhr = $.ajax

module.exports = {
  login (data) {
    App.state.loader.visible = true
    XHR.send({
      url: `${config.app_url}/auth/login`,
      method: 'post',
      jsonData: data,
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done: (response,xhr) => {
        App.state.loader.visible = false
        if (xhr.status == 200) {
          App.state.session.access_token = response.access_token
          //if (response.login_type) {
          //  switch (response.login_type) {
          //    case 'ldap':
          //      App.state.session.accountPreferences.showAccountActions = false
          //      App.state.session.accountPreferences.showMembersTab = false
          //      break
          //    default:
          //  }
          //}
        } else {
          bootbox.alert('Login error, please try again')
        }
      },
      fail: (err,xhr) => {
        App.state.loader.visible = false
        var errorMsg = 'Login error, please try again'
        if (xhr.status == 400) {
          errorMsg = 'Login error, invalid credentials'
          if(xhr.response && xhr.response.error == 'inactiveUser') {
            errorMsg = 'The account you are trying to use is not verified yet. <br> We sent you a new account verification email. <br> Follow the instructions to complete this account registration.'
          }
        }
        bootbox.alert(errorMsg)
      }
    })
  },
  logout () {
    XHR.send({
      url: `${config.app_url}/session/logout`,
      method: 'get',
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
        let errorMsg = registerLang.getText(xhr.response.error) || registerLang.getText('defaultError')
        bootbox.alert(errorMsg)
      }
    })
  },
  register (data) {
    App.state.loader.visible = true

    var body = {}
    body.email = data.email
    body.username = data.email
    body.name = data.name
    body.grecaptcha = data.grecaptcha

    const req = xhr({
      url: `${config.app_url}/registeruser`,
      type: 'POST',
      data: JSON.stringify(body),
      dataType: 'json',
      contentType: 'application/json; charset=utf-8',
    })

    req.done(function (response) {
      App.state.loader.visible = false
      App.state.register.result = true
    })
    req.fail(function (jqXHR, textStatus, errorThrown) {
      App.state.loader.visible = false
      var msg = registerLang.getText(jqXHR.responseText) || registerLang.getText('defaultError')
      bootbox.alert({
        title: registerLang.getText('errorTitle'),
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
          bootbox.alert(activationLang.getText('defaultError'))
          App.state.activate.finalStep = false
        } else {
          App.state.activate.username = username
          App.state.activate.finalStep = true
        }
      },
      fail: (err,xhr) => {
        if (xhr.status == 400) {
          bootbox.alert(activationLang.getText('usernameTaken'))
          App.state.activate.finalStep = false
        } else if (xhr.status !== 201) {
          bootbox.alert(activationLang.getText('defaultError'))
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
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done (response,xhr) {
        App.state.loader.visible = false
        if (xhr.status == 200) {
          bootbox.alert({
            // message: 'Registration is completed',
            message: activationLang.getText('success'),
            callback: () => {
              App.state.session.access_token = response.access_token
            }
          })
        } else {
          bootbox.alert({
            message: activationLang.getText('defaultError'),
            callback: () => {
            }
          })
        }
      },
      fail (err,xhr) {
        App.state.loader.visible = false
        if (xhr.status == 400) {
          bootbox.alert({
            message: activationLang.getText(xhr.response.body.errorCode) ||
            xhr.response.body.error ||
            activationLang.getText('defaultError'),
            callback: () => {
            }
          })
        } else {
          bootbox.alert({
            message: activationLang.getText('defaultError'),
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
  },
  resetPassword(data) {
    App.state.loader.visible = true

    XHR.send({
      url: `${config.app_url}/password/reset`,
      method: 'put',
      jsonData: data,
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done (response,xhr) {
        App.state.loader.visible = false
        App.navigate('login')
        if (xhr.status == 200) {
          bootbox.alert({
            message: 'Password reset successful.',
            callback: () => {
            }
          })
        } else {
          bootbox.alert({
            message: 'Error, password reset token expired, try again.',
            callback: () => {
            }
          })
        }
      },
      fail (err,xhr) {
        App.state.loader.visible = false
        App.navigate('login')
        if (xhr.status == 400) {
          bootbox.alert({
            message: xhr.response.body.error || 'Error, password reset token expired, try again.',
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
  changePassword (userId, data) {
    const body = Object.assign({},data)
    body.id = userId
    App.state.loader.visible = true

    XHR.send({
      url: `/auth/local/update`,
      method: 'post',
      jsonData: body,
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done: (response,xhr) => {
        App.state.loader.visible = false
        if (xhr.status !== 200) {
          bootbox.alert({
            title: 'Error',
            message: 'Error changing password.'
          })
        } else {
          bootbox.alert({
            title: 'Success',
            message: 'Password updated.'
          })
        }
      },
      fail: (err,xhr) => {
        App.state.loader.visible = false
        if (xhr.status == 400) {
          bootbox.alert({
            title: 'Error',
            message: 'Invalid current password.'
          })
        } else {
          bootbox.alert({
            title: 'Error',
            message: 'Error changing password.'
          })
        }
      }
    })
  }
}
