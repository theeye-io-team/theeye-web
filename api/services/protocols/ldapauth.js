var TheEyeClient = require('../../libs/theeye-client')
var logger = require('../../libs/logger')('services:ldapauth')
var _ = require('underscore')

const ldapConfig = sails.config.passport['ldapauth']

const getUserCredential = function (groups) {
  if (/theeye_owners/i.test(groups)) {
    return 'owner'
  } else if (/theeye_admins/i.test(groups)) {
    return 'admin'
  } else if (/theeye_managers/i.test(groups)) {
    return 'manager'
  } else if (/theeye_users/i.test(groups)) {
    return 'user'
  } else {
    return 'viewer'
  }
}

const parseProfile = function (profile) {
  let data = {
    username: profile[ldapConfig.fields.username],
    name: profile[ldapConfig.fields.name],
    email: profile[ldapConfig.fields.email],
    customers: [ldapConfig.customerName],
    credential: getUserCredential(profile[ldapConfig.fields.groups]),
    enabled: true
  }
  return data
}

const checkAndCreateCustomer = function (customerName, client, callback) {
  client.get({
    route: '/customer',
    query: {
      'name': customerName
    },
    success: customers => {
      if (customers.length) {
        callback(null)
      } else {
        client.create({
          route: '/customer',
          body: {
            name: customerName
          },
          success: customer => {
            callback(null)
          },
          failure: err => {
            callback(err)
          }
        })
      }
    },
    failure: err => {
      callback(err)
    }
  })
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
  let provider = ldapConfig.provider
  let identifier = profile[ldapConfig.fields.id]

  logger.log('Parsing LDAP profile.')

  if(!profile[ldapConfig.fields.username] || !profile[ldapConfig.fields.email]) {
    logger.error('Invalid LDAP Profile.')
    logger.error(profile)
    let profileError = new Error('Missing LDAP Profile values.')
    return next(profileError)
  }

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
          if (err) {
            logger.error('%o', err)
            return next(err)
          }

          return next(null, user)
        })
      } else {
        checkAndCreateCustomer(data.customers[0], client, function (err) {
          if (err) {
            logger.error('Error checking customer exists.')
            logger.error('%o', err)
            return next(err)
          }

          passport.protocols.local.createUser(data, function (err, newUser) {
            if (err) {
              logger.error('Error creating local passport.')
              logger.error('%o', err)
              return next(err)
            }

            var theeyeuser = {
              email: newUser.email,
              customers: newUser.customers,
              credential: newUser.credential,
              enabled: true,
              username: newUser.username || newUser.email
            }

            passport.createTheeyeUser(
              newUser, theeyeuser, client, function (err, profile) {
                if (err) {
                  logger.error('Error creating theeye user.')
                  logger.error('%o', err)
                  return next(err)
                }

                passport.connectLdapAuth(provider, identifier, newUser, next)
              }
            )
          })
        })
      }
    })
  })
}
