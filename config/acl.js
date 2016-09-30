"use strict";

var extend = require('lodash/assign');

var user = {
  "api" : ['*'],
  "events"    : ['*'],
  "hoststats" : ['*'],
  "palanca"   : ['*'],
  "auth"      : ['login', 'activate', 'google', 'connect', 'unlink', 'logout'],
  "user"      : ['profile','setcustomer'],
};

var admin = extend({},user,{
  "tasks"                    : ['*'],
  "script"                   : ['*'],
  "resource"                 : ['*'],
  "hostgroup"                : ['*'],
  "hostgrouptasktemplate"    : ['*'],
  "hostgroupmonitortemplate" : ['*'],
});

var owner = extend({},admin,{
  "auth" : ['*'],
  "user" : ['profile','setcustomer'],
});

var root = extend({},admin,{
  "user"     : ['*'],
  "customer" : ['*'],
});

module.exports.acl = {
  root: root,
  owner: owner,
  admin: admin,
  user: user
};
