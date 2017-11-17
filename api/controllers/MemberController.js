/* global async, Passport, sails, User */
var passport = require('../services/passport')
var mailer = require('../services/mailer')
var difference = require('lodash/difference')
var debug = require('debug')('eye:web:controller:member');

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
          sails.log.error(error);
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
              sails.log.error(error);
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
          sails.log.error(error);
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
              sails.log.error(error);
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
    return passport.inviteUser(req, res, function(err, user) {
      if(err) {
        sails.log.error(err);
        return res.send(500, err);
      } else {
        var member = {
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
        return res.send(200, member);
      }
    });
  }
}
