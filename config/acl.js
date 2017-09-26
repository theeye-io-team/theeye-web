'use strict';

const assign = require('lodash/assign')

var viewer = {
  'sockets': ['*'],
  'fileapi':['*'],
  'api':['*'],
  'apiv2':['*'],
  'spa':['*'],
  'dashboard':['index'],
  'events':['index'],
  'password': ['*'],
  'auth': ['login','activate','google','connect','unlink','logout'],
  'user': ['myprofile','profile','setcustomer','ampersand'],
}

var user = assign({},viewer,{
  'events': ['*'],
  'hoststats': ['*'],
  'palanca': ['*'],
});

var admin = assign({},user,{
  'workflow' : ['index'],
  'webhook' : ['index'],
  'tasks' : ['*'],
  'script' : ['*'],
  'resource' : ['*'],
  'hostgroup' : ['*'],
  "scheduler" : ['*'],
});

var owner = assign({},admin,{
  'auth' : ['*']
});

var root = assign({},admin,{
  'user'     : ['*'],
  'customer' : ['*']
});

module.exports.acl = {
  root: root,
  owner: owner,
  admin: admin,
  user: user,
  viewer: viewer
};
