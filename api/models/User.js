var debug = require('debug')('eye:model:user');
var User = {
  // Enforce model schema in the case of schemaless databases
  schema: true,
  tableName: 'web_user',
  attributes: {
    username: { type: 'string', unique: true, required: true, notNull:true, truthy: true },
    email: { type: 'email', unique: true, required: true, notNull:true, truthy: true },
    customers: { type: 'array', defaultsTo: [] },
    credential: { type: 'string', defaultsTo: 'admin' },
    enabled: { type: 'boolean', defaultsTo: false },
    invitation_token: { type: 'string', defaultsTo: "" },
    passports: { collection: 'Passport', via: 'user' }
  },
  beforeCreate: function(values, next) {
    var email = values.email;
    var username = values.username;

    if(!email){
      var error = {
        invalidAttributes: { email: true },
        code: 'E_VALIDATION'
      };
      return next(error);
    }

    if(!username){
      var error = {
        invalidAttributes: { username: true },
        code: 'E_VALIDATION'
      };
      return next(error);
    }

    this.find({
      $or: [
        { email: email },
        { username: username }
      ]
    }).exec(function(err, result) {
      if(err) return debug(err);

      if( result.length > 0 )
      {
        if(result[0].username == username)
          error = { invalidAttributes: { username: true }, code: 'E_VALIDATION' };
        if(result[0].email == email)
          error = { invalidAttributes: { email: true }, code: 'E_VALIDATION' };

        return next(error);
      } else {
        return next();
      }
    });
  }
};

module.exports = User;
