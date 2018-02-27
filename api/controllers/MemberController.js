/* global async, Passport, sails, User */
var passport = require('../services/passport')
var mailer = require('../services/mailer')
var difference = require('lodash/difference')

const logger = require('../libs/logger')('controllers:member')

var MemberController = module.exports = {
  //GET  /member

  fetch: function(req, res) {
    var supervisor = req.supervisor;
    var customerName = req.user.current_customer;
    if(!customerName)
      return res.send(400, 'Customer name required.');

    User.find({
      username : { $ne: null }
    }, function(error, users) {
      if(error) return res.send(500, error);
      users = users.filter(user  => user.customers.includes(customerName));

      var members = users.map((user, index) => {
        return {
          id: user.id,
          user_id: user.id,
          credential: user.credential,
          user: {
            id: user.id,
            username: user.username,
            credential: user.credential,
            email: user.email,
            enabled: user.enabled
          }
        }
      });
      return res.json(members);
    });
  },
  /**
   *
   * PUT  /user/:id/customer
   *
   */
  removemember (req, res) {
    var params = req.params.all();
    var userId = params.id;
    var customerName = req.user.current_customer;

    if (!params.id) {
      return res.send(400, 'User id is required')
    }

    if (!customerName) {
      return res.send(400, 'Customer is required')
    }

    User.findOne({ id: userId },(error,user) => {
      if (!user) return res.send(404,'User not found')

      params.customers = user.customers.filter(customer => {
        return customer !== customerName
      })

      User.update({id: userId}, params).exec((error,user) => {
        if(error){
          logger.error('%o',error);
          return res.send(500, 'Internal server error');
        }

        var route = customerName + '/member';

        passport.protocols.theeye.removeMemberFromCustomer(
          userId,
          params,
          req.supervisor,
          route,
          error => {
            if (error) {
              logger.error('%o',error);
              res.json(500,'The user was updated but with errors. ' + error.message);
            } else {
              res.send(203,{});
            }
          }
        );
      });
    });
  },
  updatemembercredential (req, res) {
    var params = req.params.all();
    var userId = params.id;
    var credential = params.credential;

    if (!params.id) {
      return res.send(400, 'User id is required')
    }

    if (!params.credential) {
      return res.send(400, 'Credential is required')
    }

    User.findOne({ id: userId },(error,user) => {
      if (!user) return res.send(404,'User not found')

      User.update({id: userId}, params).exec((error,users) => {
        if(error){
          logger.error('%o',error);
          return res.send(500, 'Internal server error');
        }
        var updatedUser = users[0]
        var member = {
          id: updatedUser.id,
          user_id: updatedUser.id,
          credential: updatedUser.credential,
          user: {
            id: updatedUser.id,
            username: updatedUser.username,
            credential: updatedUser.credential,
            email: updatedUser.email,
            enabled: updatedUser.enabled
          }
        }
        var route = req.user.current_customer + '/member/';

        passport.protocols.theeye.updateMemberCredential(
          userId,
          params,
          req.supervisor,
          route,
          error => {
            if (error) {
              logger.error('%o',error);
              res.json(500,'The user was updated but with errors. ' + error.message);
            } else {
              res.send(200, member);
            }
          }
        );
      });
    });
  },
  inviteMember: function(req, res) {
    var params = req.params.all();
    if (!params.user.email) return res.send(400, 'email is required')
    if (!params.credential) return res.send(400, 'credential is required')

    User.findOne({email: params.user.email}).exec((error,user) => {
      if(error)
        res.send(500, error)
      var data = {}
      var member = {}
      if(user) {
        //if user exist invite him/her to this customer
        data = {
          email: user.email,
          customer: req.user.current_customer
        }
        passport.inviteMember(req, res, data, function(err, result) {
          if(err) {
            logger.error('%o',err);
            return res.send(400, err);
          }
          member = {
            id: result.member.id,
            user_id: result.member.id,
            credential: result.member.credential,
            user: {
              id: result.member.id,
              username: result.member.username,
              credential: result.member.credential,
              email: result.member.email,
              enabled: result.member.enabled
            }
          }
          return res.send(200, {member:member, resend:result.resend});
        });
      } else {
        //if user doesnt exist, create one
        data = {
          username: params.user.email,
          email: params.user.email,
          customers:[req.user.current_customer],
          credential: params.credential,
          enabled: false
        }
        passport.createUser(req, res, data, function(err, user) {
          if(err) {
            logger.error('%o',err);
            return res.send(400, err);
          }
          member = {
            id: user.id,
            user_id: user.id,
            credential: user.credential,
            user: {
              id: user.id,
              username: user.username,
              credential: user.credential,
              email: user.email,
              enabled: user.enabled
            }
          }
          return res.send(200, {member:member, resend: false});
        });
      }
    });
  }
}
