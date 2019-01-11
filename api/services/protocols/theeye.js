/**
 *
 * TheEye Authentication Protocol
 *
 */
var format = require('util').format
var logger = require('../../libs/logger')('service:protocols:theeye')

/**
 * @author Facundo
 * @param {Object} localUser data already created local user
 * @param {Object} params new user data
 * @param {Function} next callback
 */
exports.createUser = function (localUser, params, supervisor, next) {
  params.enabled = true
  supervisor.create({
    route: '/user',
    body: params,
    success: (body) => {
      if (!body) {
        return next(null)
      }

      var profile = body.user

      var customers = profile.customers.map(
        customer => {
          return {
            _id: customer.id,
            name: customer.name
          }
        }
      )

      Passport.create({
        protocol: 'theeye',
        provider: 'theeye',
        user: localUser.id,
        token: profile.token,
        api_user: profile.id,
        profile: profile
      }, function (err, passport) {
        if (err) {
          logger.error('%o', err)
          return next(err)
        }
        return next(null, profile)
      })
    },
    failure: (err) => {
      logger.error(err.body)
      return next(err)
    }
  })
}

/**
 * @author Facundo
 * @param {Object} user
 * @param {Object} supervisor , autenticated supervisor client
 * @param {Function} doneFn
 */
exports.refreshToken = function (user, supervisor, doneFn) {
}

/**
 * @author Facundo
 * @param {Object} userId , local user id
 * @param {Array} updates
 * @param {Object} supervisor , autenticated supervisor client
 * @param {Function} doneFn
 */
exports.updateUser = function (userId, updates, supervisor, doneFn) {
  Passport.findOne({
    user: userId,
    protocol: 'theeye'
  }, function (error, passport) {
    if (error) {
      logger.error('%o', error)
      return doneFn(error)
    }

    if (!passport) {
      logger.error('passport not found. ' + passport)
      return doneFn()
    }
    supervisor.patch({
      route: '/user',
      id: passport.profile.id,
      body: updates,
      success: (res) => {
        passport.profile = res.user
        passport.save((err) => doneFn(err))
      },
      failure: (err) => doneFn(err)
    })
  })
}

/**
 * @author Tomas
 * @param {Object} userId , local user id
 * @param {Array} updates
 * @param {Object} supervisor , autenticated supervisor client
 * @param {String} route
 * @param {Function} doneFn
 */
exports.updateMemberCredential = function (userId, updates, supervisor, route, doneFn) {
  Passport.findOne({
    user: userId,
    protocol: 'theeye'
  }, function (error, passport) {
    if (error) {
      logger.error('%o', error)
      return doneFn(error)
    }

    if (!passport) {
      logger.error('passport not found. ' + passport)
      return doneFn()
    }

    supervisor.patch({
      route: route += passport.profile.id + '/credential',
      body: updates,
      success: (res) => {
        passport.profile.credential = res.credential
        passport.save((err) => doneFn(err))
      },
      failure: (err) => doneFn(err)
    })
  })
}

/**
 * @author Tomas
 * @param {Object} userId , local user id
 * @param {Array} updates
 * @param {Object} supervisor , autenticated supervisor client
 * @param {String} route
 * @param {Function} doneFn
 */
exports.removeMemberFromCustomer = function (userId, updates, supervisor, route, doneFn) {
  Passport.findOne({
    user: userId,
    protocol: 'theeye'
  }, function (error, passport) {
    if (error) {
      logger.error('%o', error)
      return doneFn(error)
    }

    if (!passport) {
      logger.error('passport not found. ' + passport)
      return doneFn()
    }

    supervisor.remove({
      route: route,
      id: passport.profile.id,
      body: updates,
      success: (res) => {
        passport.profile = res
        passport.save((err) => doneFn(err))
      },
      failure: (err) => doneFn(err)
    })
  })
}

/**
 * @author Tomas
 * @param {Object} userId , local user id
 * @param {Array} updates
 * @param {Object} supervisor , autenticated supervisor client
 * @param {String} route
 * @param {Function} doneFn
 */
exports.addMemberToCustomer = function (userId, updates, supervisor, route, doneFn) {
  Passport.findOne({
    user: userId,
    protocol: 'theeye'
  }, function (error, passport) {
    if (error) {
      logger.error('%o', error)
      return doneFn(error)
    }

    if (!passport) {
      logger.error('passport not found. ' + passport)
      return doneFn()
    }

    supervisor.patch({
      route: route += passport.profile.id + '/customers',
      body: updates,
      success: (res) => {
        passport.profile = res
        passport.save((err) => doneFn(err))
      },
      failure: (err) => doneFn(err)
    })
  })
}

/**
 * @author Tomas
 * @param {Object} customer
 * @param {Object} supervisor , autenticated supervisor client
 * @param {Function} done
 */
exports.getCustomerAgentCredentials = function (customer, supervisor, done) {
  supervisor.fetch({
    route: '/:customer/user',
    query: {
      where: {
        credential: 'agent',
        'customers.name': customer
      },
      limit: 1
    },
    success: users => {
      if (!users || users.length === 0) {
        return done(null, [])
      }

      var user = users[0]

      // agents MUST have only one customer
      if (!user.customers || user.customers.length === 0) {
        return done(null, [])
      }

      var customer = user.customers[0]

      user.curl = format(
        'curl -s "%s" | bash -s "%s" "%s" "%s" ',
        sails.config.application.agentInstallerUrl.linux,
        user.client_id,
        user.client_secret,
        customer.name
      )

      user.windowsCurl = format(
        'powershell -command "& {&"Invoke-WebRequest" -uri "%s" -outFile agent-installer.ps1}" && powershell.exe -ExecutionPolicy ByPass -File agent-installer.ps1 "%s" "%s" "%s" ',
        sails.config.application.agentInstallerUrl.windows,
        user.client_id,
        user.client_secret,
        customer.name
      )

      user.dockerCurl = format(
        'docker run --name "%s" -e NODE_ENV="production" -e THEEYE_SUPERVISOR_CLIENT_ID="%s" -e THEEYE_SUPERVISOR_CLIENT_SECRET="%s"  -e THEEYE_SUPERVISOR_CLIENT_CUSTOMER="%s"  -e THEEYE_SUPERVISOR_API_URL="%s" -e THEEYE_CLIENT_HOSTNAME="%s" -d interactar/theeye-agent',
        customer.name,
        user.client_id,
        user.client_secret,
        customer.name,
        sails.config.supervisor.url,
        customer.name
      )

      user.awsCurl = format(
        '#!/bin/bash \n hostnamectl set-hostname %s-aws \n curl -s "%s" | bash -s "%s" "%s" "%s" ',
        customer.name,
        sails.config.application.agentInstallerUrl.linux,
        user.client_id,
        user.client_secret,
        customer.name
      )

      return done(null, user)
    },
    failure: err => done(err)
  })
}
