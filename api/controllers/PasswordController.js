var passport = require('../services/passport');
var mailer = require("../services/mailer");
var jwt = require('jsonwebtoken');
var crypto = require('crypto');

module.exports = {
  /**
   *
   *
   *
   */
  sendResetMail: function(req,res,next) {
    var email = req.params.all().email; // every posible param
    sails.log.debug('searching ' + email);
    User.findOne({ email: email },function(err,user){
      if( err ) return res.send(500,err);
      if( ! user ) return res.send(400,"User not found");

      var secret = sails.config.application.secret ;
      var token = jwt.sign({ user: user }, secret, { expiresIn: "12h" });
      var url = passport.protocols.local.getPasswordResetLink(token)

      mailer.sendPasswordRecoveryEMail({
        url: url,
        user: user
      },function(err){
        if(err) {
          sails.log.error("Error sending email to " + email);
          sails.log.error(err);
          return res.send(500,err);
        }

        return res.send(200,{ message: 'ok' });
      });
    });
  },
  verifyPasswordResetToken (req, res) {
    if(!req.query.token)
      return res.send(400);

    var secret = sails.config.application.secret;
    jwt.verify(req.query.token,secret,function(err, decoded){
      if(err){
        sails.log.error(err);
        return res.send(400);
      }

      var user = decoded.user;
      var resetToken = jwt.sign({user:user},secret,{ expiresIn: "5m" });
      return res.json({resetToken: resetToken})
    })
  },
  reset: function(req,res,next){
    var params = req.params.all();
    
    if(
      ! params.token ||
      ! params.password ||
      ! params.confirmation
    ) return res.send(400);

    if( params.password != params.confirmation )
      return res.send(400,'Passwords does not match');

    var secret = sails.config.application.secret;
    jwt.verify(params.token,secret,function(err, decoded){
      if(err){
        sails.log.error(err);
        return res.send(400,'Invalid password reset token, try again.');
      }

      var user = decoded.user;
      passport.protocols.local.reset({
        email: user.email,
        password: params.password
      }, err => {
        if(err){
          if(err.message == 'Invalid password'){
            return res.send(400, 'The password must have at least 8 characters long');
          }
          sails.log.error( err );
          return res.send(500, 'Error updating password, try again.');
        }
        res.send(200);
      });
    });
  }
}
