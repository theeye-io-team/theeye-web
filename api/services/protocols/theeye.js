/**
 *
 * TheEye Authentication Protocol
 *
 */
var format = require('util').format;
var debug = require('debug')('eye:web:service:protocol:theeye');


/**
 * @author Facundo
 * @param {Object} localUser data already created local user
 * @param {Object} params new user data
 * @param {Function} next callback
 */
exports.createUser = function (localUser, params, supervisor, next) {
  params.enabled = true;
  supervisor.create({
    route:'/user',
    body:params,
    success:(body) => {
      if (!body) {
        return next(null);
      }

      var profile = body.user;

      var customers = profile.customers.map(
        customer => {
          return {
            _id: customer.id,
            name: customer.name
          }
        }
      );

      Passport.create({
        protocol: 'theeye',
        provider: 'theeye',
        user: localUser.id ,
        token: profile.token,
        api_user: profile.id,
        profile: profile
      }, function (err, passport) {
        if (err) {
          sails.log.error(err);
          return next(err);
        }
        return next(null, profile);
      });
    },
    failure:(err) => {
      sails.log.error(err);
      return next(err);
    }
  })
}

/**
 * @author Facundo
 * @param {Object} user
 * @param {Object} supervisor , autenticated supervisor client
 * @param {Function} doneFn
 */
exports.refreshToken = function(user, supervisor, doneFn)
{
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
  }, function(error, passport) {

    if (error) {
      sails.log.error(error);
      return doneFn(error);
    }

    if (!passport) {
      sails.log.error('passport not found. ' + passport);
      return doneFn(new Error('theeye passport not found'));
    }

    supervisor.patch({
      route: '/user',
      id: passport.profile.id,
      body: updates,
      success: (res) => {
        passport.profile = res.user;
        passport.save( (err) => doneFn(err) );
      },
      failure: (err) => doneFn(err) 
    });

  });
}

var AGENT_INSTALLER_URL = 'http://interactar.com/public/install/041fc48819b171530c47c0d598bf75ad08188836/setup_generic.sh' ;

exports.getCustomerAgentCredentials = function (customer,supervisor,done) {
  supervisor.fetch({
    route:'/:customer/user',
    query: {
      where: {
        credential:'agent',
        'customers.name':customer
      },
      limit:1
    },
    success: users => {
      if (!users||users.length===0) {
        return done(null,[]);
      }
      var user = users[0];
      user.curl = format(
        'curl -s "%s" | bash -s "%s" "%s" "%s" ',
        AGENT_INSTALLER_URL,
        user.client_id,
        user.client_secret,
        user.customers[0].name // agents MUST have only one customer
      );
      return done(null, user);
    },
    failure: err => done(err)
  });
}
