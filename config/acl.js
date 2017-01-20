'use strict';

var extend = require('lodash/assign');

var viewer = {
  'fileapi':['*'],
  'api':['*'],
  'dashboard':['index'],
  'events':['index'],
  'password': ['*'],
  'auth': ['login','activate','google','connect','unlink','logout'],
  'user': ['profile','setcustomer']
}

var user = extend({},viewer,{
  'events': ['*'],
  'hoststats': ['*'],
  'palanca': ['*']
});

var admin = extend({},user,{
  'workflow' : ['index'],
  'webhook' : ['index'],
  'scheduler' : ['index'],
  'tasks' : ['*'],
  'script' : ['*'],
  'resource' : ['*'],
  'hostgroup' : ['*'],
  'hostgrouptasktemplate' : ['*'],
  'hostgroupmonitortemplate' : ['*']
});

var owner = extend({},admin,{
  'auth' : ['*'],
  'user' : ['profile','setcustomer']
});

var root = extend({},admin,{
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
