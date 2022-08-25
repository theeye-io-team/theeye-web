
import App from 'ampersand-app'
import XHR from 'lib/xhr'
import bootbox from 'bootbox'
import registerLang from 'language/register'
import activationLang from 'language/activation'
import search from 'lib/query-params'

export default {
  login (data) {
    App.state.loader.visible = true

    let credentials = btoa(`${data.username}:${data.password}`)
    XHR.send({
      url: `${App.config.app_url}/api/auth/login`,
      method: 'post',
      jsonData: data,
      headers: {
        Accept: 'application/json;charset=UTF-8',
        Authorization: `Basic ${credentials}`
      },
      done: (response, xhr) => {
        App.state.loader.visible = false
        if (xhr.status === 200) {
          App.state.session.access_token = response.access_token
        } else {
          bootbox.alert('Login error, try again later.')
        }
      },
      fail: (err,xhr) => {
        App.state.loader.visible = false
        var errorMsg = 'Login error, please try again'
        if (xhr.status === 401) {
          bootbox.alert('Invalid credentials.')
        } else if (xhr.status === 403) {
          bootbox.alert(xhr.response || 'The account is locked.')
        } else if (xhr.status == 400) {
          if (xhr.response && xhr.response.error == 'inactiveUser') {
            errorMsg = 'The account you are trying to use is not verified yet. <br> We sent you a new account verification email. <br> Follow the instructions to complete this account registration.'
          } else {
            errorMsg = 'Login error, invalid credentials'
          }
          bootbox.alert(errorMsg)
        } else {
          bootbox.alert(err.message || errorMsg)
        }
      }
    })
  },
  register (data) {
   App.state.loader.visible = true

   let body = {}
   body.email = data.email
   body.username = data.email
   body.name = data.name
   body.grecaptcha = data.grecaptcha

   XHR.send({
     url: `${App.config.api_url}/registration/register`,
     method: 'POST',
     jsonData: body,
     headers: {
       Accept: 'application/json;charset=UTF-8'
     },
     done (response, xhr) {
       App.state.loader.visible = false
       App.state.register.result = true
     },
     fail (err, xhr) {
       App.state.loader.visible = false
       let msg = registerLang.getText(xhr.response.code) || registerLang.getText('defaultError')
       bootbox.alert({
         title: registerLang.getText('errorTitle'),
         message: msg
       })
     }
   })
  },
  checkUsername (username, token) {
    XHR.send({
      url: `${App.config.api_url}/registration/checkusername?token=` + encodeURIComponent(token) + '&username=' + encodeURIComponent(username),
      method: 'get',
      done: (response,xhr) => {
        if (xhr.status !== 200) {
          bootbox.alert(activationLang.getText('defaultError'))
          App.state.activate.finalStep = false
        } else {
          App.state.activate.username = username
          App.state.activate.finalStep = true
        }
      },
      fail: (err,xhr) => {
        if (xhr.status == 409) {
          bootbox.alert(activationLang.getText('usernameTaken'))
          App.state.activate.finalStep = false
        } else {
          bootbox.alert(activationLang.getText('defaultError'))
          App.state.activate.finalStep = false
        }
      }
    })
  },
  finishRegistration (data) {
    App.state.loader.visible = true
    delete data.confirmPassword

    XHR.send({
      url: `${App.config.api_url}/registration/finish`,
      method: 'post',
      jsonData: data,
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done (response,xhr) {
        App.state.loader.visible = false
        if (xhr.status == 200) {
          bootbox.alert({
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
            message: activationLang.getText(xhr.response.message) ||
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
  activate (data) {
    App.state.loader.visible = true
    delete data.confirmPassword

    XHR.send({
      url: `${App.config.api_url}/registration/activate`,
      method: 'post',
      jsonData: data,
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done (response,xhr) {
        App.state.loader.visible = false
        if (xhr.status == 200) {
          bootbox.alert({
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
            message: activationLang.getText(xhr.response.message) ||
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
  togglePasswordLoginForm () {
    App.state.login.toggle('showRecoverForm')
  },
  recoverPassword (data) {
    App.state.loader.visible = true
    XHR.send({
      url: `${App.config.api_url}/auth/password/recover`,
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
              App.state.login.showRecoverForm = false
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
  resetPassword(data) {
    App.state.loader.visible = true

    XHR.send({
      url: `${App.config.app_url}/api/auth/password/reset`,
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
            message: 'Error, please try again.',
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
            message: registerLang.getText(xhr.response.error) || 'Error, please try again',
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
      url: `${App.config.api_url}/auth/password/change`,
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
  },
  verifyInvitationToken (callback) {
    const query = search.get()
    const invitation_token = query.token
    if (!invitation_token) {
      return App.navigate('login')
    }

    XHR.send({
      url: `${App.config.api_url}/registration/verifyinvitationtoken?invitation_token=${encodeURIComponent(invitation_token)}`,
      method: 'get',
      responseType: 'json',
      done (response,xhr) {
        if (xhr.status == 200) {
          App.state.activate.username = response.username
          App.state.activate.email = response.email
          App.state.activate.invitation_token = response.invitation_token

          callback()
        } else {
          bootbox.alert("Invalid activation link")
          App.navigate('login')
        }
      },
      fail (err,xhr) {
        bootbox.alert("Error activating user")
        App.navigate('login')
      }
    })
  },
  /**
   * @param {String} provider
   */
  loginProvider (provider) {
    window.location.replace(`${App.config.api_url}/auth/social/${provider}`)
  },
  /**
   * @param {String} provider
   */
  connectProvider (provider) {
    window.location.replace(`${App.config.api_url}/auth/social/${provider}`)
  },
  /**
   * @param {Object} Passport
   */
  disconnectProvider ({ provider, id }) {
    XHR.send({
      url: `${App.config.api_url}/auth/social/${provider}/disconnect/${id}`,
      method: 'delete',
      responseType: 'json',
      done () {
        // re-fetch passports
        App.actions.session.getPassports()
      }
    })
  }
}
