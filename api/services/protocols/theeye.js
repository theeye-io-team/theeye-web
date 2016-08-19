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
exports.createUser = function(localUser, params, supervisor, next)
{
  params.enabled = true;
  supervisor.userCreate(params, function (err, profile) {
    if (err || !profile ) return next(err, profile);

    var customers = profile
    .customers
    .map(function(customer){
      return {
        _id: customer.id,
        name: customer.name
      };
    });

    Passport.create({
      'protocol': 'theeye',
      'provider': 'theeye',
      'user': localUser.id ,
      'token': profile.token,
      'api_user': profile.id,
      'profile': {
        'id': profile.id,
        'client_id': profile.client_id,
        'client_secret': profile.client_secret,
        'customers': customers,
      }
    }, function (err, passport) {
      if (err) return next(err);
      return next(null, profile);
    });
  });
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
 * @param {Object} localUser
 * @param {Array} updates
 * @param {Object} supervisor , autenticated supervisor client
 * @param {Function} doneFn
 */
exports.updateUser = function(localUser, updates, supervisor, doneFn)
{
  Passport.findOne({
    user: localUser,
    protocol: 'theeye'
  }, function(error, passport) {

    supervisor.userUpdate(
      passport.profile.id,
      updates,
      function(error, profile){
        if(error) return doneFn(error);

        passport.profile = profile;
        passport.save(function(err){
          /** ... **/
        });

        doneFn(null, profile);
      }
    );
  });
}

var AGENT_INSTALLER_URL = 'http://interactar.com/public/install/041fc48819b171530c47c0d598bf75ad08188836/setup_generic.sh' ;

exports.getCustomerAgentCredentials = function(
  customer,
  supervisor,
  nextFn
){
  supervisor.userFetch({
    'customer': customer,
    'credential': 'agent'
  },function(error,users){
    if(error) return nextFn(error);
    if(!users) return nextFn(null);

    var user = users ? users[0] : null;
    if(user) {
      user.curl = format(
        'curl -s "%s" | bash -s "%s" "%s" "%s" ',
        AGENT_INSTALLER_URL,
        user.client_id,
        user.client_secret,
        user.customers[0].name // agents MUST have only one customer
      );
      return nextFn(null, user);
    }

    return nextFn();
  });
}
