'use strict';

const assign = Object.assign

const viewer = {
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
  'inbox': ['*'],
  'customer': ['getcustomer']
}

const user = assign({}, viewer, {
  'events': ['*'],
  'hoststats': ['*'],
  'palanca': ['*']
})

const manager = assign({}, user, {
  'member': ['*']
})

const admin = assign({},user,{
  'webhook': ['index'],
  'tasks': ['*'],
  'script': ['*'],
  'resource': ['*'],
  'hostgroup': ['*'],
  'scheduler': ['*'],
  'customer': ['getcustomer', 'getuseragent', 'editconfig']
})

const owner = assign({}, admin, {
  'auth': ['*'],
  'member': ['*']
})

const root = assign({},owner,{
  'user': ['*'],
  'customer': ['*']
})

module.exports = {
  acl: {
    root,
    owner,
    admin,
    user,
    viewer,
    manager
  }
}
