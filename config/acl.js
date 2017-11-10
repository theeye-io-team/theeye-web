'use strict';

const assign = require('lodash/assign')

var viewer = {
  'sockets': ['*'],
  'fileapi':['*'],
  'api':['*'],
  'apiv2':['*'],
  'bearer':['*'], // bearer session controller
  'dashboard':['index'],
  'events':['index'],
  'password': ['*'],
  'auth': ['login','activate','google','connect','unlink','logout'],
  'user': ['myprofile','setcustomer','ampersand'],
}

var user = assign({},viewer,{
  'events': ['*'],
  'hoststats': ['*'],
  'palanca': ['*'],
  'user': ['myprofile','setcustomer','ampersand','getuserpassport']
});

var admin = assign({},user,{
  'workflow' : ['index'],
  'webhook' : ['index'],
  'tasks' : ['*'],
  'script' : ['*'],
  'resource' : ['*'],
  'hostgroup' : ['*'],
  "scheduler" : ['*'],
  'user': ['myprofile','setcustomer','ampersand','getuserpassport']
});

var owner = assign({},admin,{
  'auth' : ['*'],
  "member" : ['*']
});

var root = assign({},admin,{
  'user'     : ['*'],
  'customer' : ['*'],
  "member" : ['*']
});

module.exports.acl = {
  root: root,
  owner: owner,
  admin: admin,
  user: user,
  viewer: viewer
};
