var TheEyeClient = require('../../libs/theeye-client')
var logger = require('../../libs/logger')('services:ldapauth')
var _ = require('underscore')

const getUserCredential = function (groups) {
  if (/Theeye_Owners/.test(groups)) {
    return 'owner'
  } else if (/Theeye_Admins/.test(groups)) {
    return 'admin'
  } else if (/Theeye_Managers/.test(groups)) {
    return 'manager'
  } else if (/Theeye_Users/.test(groups)) {
    return 'user'
  } else {
    return 'viewer'
  }
}

const parseProfile = function (profile) {
  let fields = sails.config.passport['ldapauth'].fields
  let data = {
    username: profile[fields.username],
    name: profile[fields.name],
    email: profile[fields.email],
    customers: [sails.config.passport['ldapauth'].customerName],
    credential: getUserCredential(profile[fields.groups]),
    enabled: true
  }
  return data
}

const checkAndUpdateUser = function (user, data, client, callback) {
  delete data.enabled
  delete data.email
  data.customers = user.customers

  let userId = user.id

  if (_.isMatch(user, data)) {
    return callback(null, user)
  } else {
    User.update({id: userId}, data).exec((error, updatedUsers) => {
      if (error) return callback(error)
      passport.protocols.theeye.updateUser(userId, data, client, function (error) {
        if (error) {
          logger.error(error)
          return callback(error)
        } else {
          return callback(null, user)
        }
      })
    })
  }
}

module.exports = function (req, profile, next) {
  let provider = sails.config.passport['ldapauth'].provider
  let identifier = profile[sails.config.passport['ldapauth'].fields.id]

  let data = parseProfile(profile)

  User.findOne({
    or: [
      {email: data.email},
      {username: data.username}
    ]
  }).exec((err, user) => {
    if (err) return next(err)

    var client = new TheEyeClient({
      'client_secret': sails.config.supervisor.client_secret,
      'client_id': sails.config.supervisor.client_id,
      'api_url': sails.config.supervisor.url
    })

    client.refreshToken(function (err, token) {
      if (err) {
        logger.error('%o', err)
        return next(err)
      }

      if (user) {
        checkAndUpdateUser(user, data, client, function (err, user) {
          if (err) return next(err)

          return next(null, user)
        })
      } else {
        passport.protocols.local.createUser(data, function (err, newUser) {
          if (err) return next(err)

          var theeyeuser = {
            email: newUser.email,
            customers: newUser.customers,
            credential: newUser.credential,
            enabled: true,
            username: newUser.username || newUser.email
          }

          passport.createTheeyeUser(
            newUser, theeyeuser, client, function (err, profile) {
              if (err) return next(err)
              passport.connectLdapAuth(provider, identifier, newUser, next)
            }
          )
        })
      }
    })
  })
}
