var debug = require('debug')('auth')
var app = require('ampersand-app')
var XHR = require('./xhr')

function Client (url) {
  this.serverURL = url
}

module.exports = Client

Client.prototype.base64Encode = function (unencoded) {
  return new Buffer(unencoded || '').toString('base64')
}

Client.prototype.base64Decode = function (encoded) {
  return new Buffer(encoded || '', 'base64').toString('utf8')
}

Client.prototype.verifyOAuthCode = function (url, options, doneFn) {
  var headers = { 'Content-Type': 'application/json;charset=UTF-8' }

  XHR({
    'method': 'GET',
    'url': url,
    'withCredentials': true,
    'headers': headers,
    'done': function (session, xhr) {
      if (xhr.status == 200) {
        debug('success')
        doneFn(null, session, xhr)
      } else {
        debug('invalid')
        doneFn(null, null, xhr)
      }
    },
    'fail': function (err, xhr) {
      debug('verification failed')
      doneFn(err, false, xhr)
    },
    'timeout': 5000
  })
}

Client.prototype.verifyRecaptcha = function (recaptcha, doneFn) {
  var url = this.serverURL + '/recaptcha?recaptcha=' + recaptcha

  XHR({
    'method': 'POST',
    'url': url,
    'done': function (session, xhr) {
      if (xhr.status == 200) {
        debug('success')
        doneFn(null, true, xhr)
      } else {
        debug('invalid')
        doneFn(null, false, xhr)
      }
    },
    'fail': function (err, xhr) {
      debug('verification failed')
      doneFn(err, false, xhr)
    },
    'timeout': 5000
  })
}

Client.prototype.createSession = function (username, password, callback) {
  var headers = {
    'Content-Type': 'application/json;charset=UTF-8',
    'Authorization': 'Basic ' + this.base64Encode(username + ':' + password)
  }

  XHR({
    'method': 'POST',
    'url': this.serverURL + '/token',
    'headers': headers,
    'done': function (session, xhr) {
      if (xhr.status == 200) {
        debug('refresh success')
        storeSession(session, callback)
      } else {
        errorFn(xhr, callback)
      }
    },
    'fail': function (err, xhr) {
      debug('refresh failed')
      errorFn(xhr, callback)
    },
    'timeout': 5000
  })
}

Client.prototype.authenticate = function (options, callback) {
  var self = this
  var user = options.user
  var password = options.password
  var recaptcha = options.recaptcha

  if (recaptcha) {
    self.verifyRecaptcha(recaptcha, function (err, success, xhr) {
      if (success) {
        self.createSession(user, password, callback)
      } else errorFn(xhr, callback)
    })
  } else {
    self.createSession(user, password, callback)
  }
}

Client.prototype.recoverPassword = function (email, recaptcha, callback) {
  XHR({
    'method': 'POST',
    'url': this.serverURL + '/recoverPassword?email=' + email,
    'jsonData': {
      'email': email,
      'recaptcha': recaptcha
    },
    'headers': {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    'done': function (response, xhr) {
      if (xhr.status == 200) {
        debug('request success')
        callback(null, response)
      } else {
        errorFn(xhr, callback)
      }
    },
    'fail': function (err, xhr) {
      debug('request failed')
      errorFn(xhr, callback)
    },
    'timeout': 5000
  })
}

Client.prototype.changePassword = function (password, callback) {
  var userid = app.auth.id
  var url = ':url/user/:id/password?access_token=:token'
  .replace(':url', this.serverURL)
  .replace(':id', userid)
  .replace(':token', app.auth.token)

  XHR({
    method: 'PUT',
    url: url,
    jsonData: {
      'password_new': password.new,
      'password_confirm': password.confirm,
      'password_current': password.current
    },
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    done: function (response, xhr) {
      if (xhr.status == 200) {
        debug('request success')
        callback(null, response)
      } else {
        errorFn(xhr, callback)
      }
    },
    fail: function (err, xhr) {
      debug('request failed')
      errorFn(xhr, callback)
    },
    timeout: 5000
  })
}

var errorFn = function (xhr, callback) {
  var msg
  if (xhr.status == 401) {
    msg = 'auth failed. server connection lost'
    debug(msg)
  } else {
    msg = 'server connection failed'
  }

  var err = new Error(msg)
  err.status = xhr.status
  err.xhr = xhr
  if (callback) callback(err, null, xhr)
}

Client.prototype.refreshSession = function (token, session, callback) {
  var url = this.serverURL + '/token?' +
    'access_token=' + encodeURIComponent(token) +
    '&session=' + encodeURIComponent(session)

  XHR({
    method: 'PUT',
    url: url,
    done: function (session, xhr) {
      if (xhr.status == 200) {
        debug('refresh success')
        storeSession(session, callback)
      } else {
        errorFn(xhr, callback)
      }
    },
    fail: function (err, xhr) {
      debug('refresh failed')
      errorFn(xhr, callback)
    },
    timeout: 5000
  })
}

Client.prototype.closeSession = function (token, session, callback) {
  var url = this.serverURL + '/token?' +
    'access_token=' + encodeURIComponent(token) +
    '&session=' + encodeURIComponent(session)

  XHR({
    method: 'DELETE',
    url: url,
    done: function (session, xhr) {
      if (xhr.status == 200) {
        debug('session closed')
        callback()
      } else {
        errorFn(xhr, callback)
      }
    },
    fail: function (err, xhr) {
      debug('close operation failed')
      errorFn(xhr, callback)
    },
    timeout: 5000
  })
}

function verifyUserConfiguration (user, done) {
  app.storage.app.getItem('config', function (error, config) {
    if (config.lastUserId && config.lastUserId != user.id) {
      app.resetConfiguration(function () {
        debug('app configuration reset')
        done()
      })
    } else done()
  })
}

function storeSession (session, done) {
  app.storage.app.setItem('auth', session, function (error) {
    // storage error
    if (error) {
      debug('ERROR while trying to store auth data')
      debug(error)
    } else {
      debug('token stored')
    }

    app.auth = session
    verifyUserConfiguration(session, function () {
      done(null, session)
    })
  })
}
