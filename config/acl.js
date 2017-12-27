'use strict';

const assign = require('lodash/assign')

var viewer = {
  'sockets': ['*'],
  'fileapi':['*'],
  'api':['*'],
  'apiv2':['*'],
  'apiv3':['*'],
  'bearer':['*'], // bearer session controller
  'dashboard':['index'],
  'events':['index'],
  'password': ['*'],
  'member' : ['fetch'],
  'auth': ['login','activate','google','connect','unlink','logout'],
  'user': ['myprofile','setcustomer','ampersand','getuserpassport','registerdevicetoken'],
  'inbox': ['*']
}

var user = assign({},viewer,{
  'events': ['*'],
  'hoststats': ['*'],
  'palanca': ['*']
});

var manager = assign({},user,{
  'member' : ['*']
});

var admin = assign({},user,{
  'workflow' : ['index'],
  'webhook' : ['index'],
  'tasks' : ['*'],
  'script' : ['*'],
  'resource' : ['*'],
  'hostgroup' : ['*'],
  'scheduler' : ['*'],
  'customer' : ['getuseragent', 'editconfig']
});

var owner = assign({},admin,manager,{
  'auth' : ['*']
});

var root = assign({},owner,{
  'user'     : ['*'],
  'customer' : ['*']
});

module.exports.acl = {
  root: root,
  owner: owner,
  admin: admin,
  user: user,
  viewer: viewer,
  manager: manager
};
