'use strict';

/* global async */
var debug = require('debug')('eye:web:controller:resource');
var moment = require('moment');
var extend = require('util')._extend;

var toBoolean = function (value) {
  if(value==='true'||value===true)
    return true;
  if(value==='false'||value===false)
    return false;
  return null;
};

module.exports = {
  //////////////////////////////////MVC ACTIONS//////////////////////////////////
  index: function(req, res) {
    var supervisor = req.supervisor;
    async.parallel({
      monitors: (callback) => supervisor.fetch({
        route: supervisor.MONITORS,
        success: (monitors) => callback(null,monitors),
        failure: (error) => callback(error)
      }),
      scripts: (callback) => supervisor.scripts(callback),
      hosts: (callback) => supervisor.hosts(callback),
      //resourceTypes: (callback) => supervisor.resourceTypes(callback),
      tags: (callback) => supervisor.tags(callback)
    }, function(err, data) {
      if (err) return res.serverError("Error getting data from supervisor: " + err.toString());

      // milliseconds
      function minutesToMillisecondsString(mins){
        return String( mins * 60 * 1000 );
      }
      data.looptimes = [
        {'id':10000,'value':'10 seconds'},
        {'id':minutesToMillisecondsString(0.25),'value':'0.25'},
        {'id':minutesToMillisecondsString(0.5),'value':'0.5'},
        {'id':minutesToMillisecondsString(1),'value':'1'},
        {'id':minutesToMillisecondsString(5),'value':'5'},
        {'id':minutesToMillisecondsString(15),'value':'15'},
        {'id':minutesToMillisecondsString(30),'value':'30'},
        {'id':minutesToMillisecondsString(60),'value':'60'}
      ];

      // milliseconds
      data.timeouts = [
        {'id':5000, 'value':5},
        {'id':10000, 'value':10},
        {'id':15000, 'value':15}
      ];
      data.moment = moment;
      res.view(data);
    });
  },
  ////////////////////////////////REST ENDPOINTS////////////////////////////////
  /**
   * Remove resource
   * DEL /resource
   */
  destroy : function(req, res,next) {
    var supervisor = req.supervisor;
    var id = req.param("id",null);
    if( !id || !id.match(/^[a-fA-F0-9]{24}$/) ) {
      return res.send(400,'invalid id');
    } else {
      supervisor.deleteResource( id, function(err){
        if (err) return res.send(500, err);
        res.send(200,"Resource %s deleted".replace('%s',id));
      });
    }
  },
  /**
   * Create resource
   * POST /resource
   */
  create : function(req,res,next) {
    var supervisor = req.supervisor;
    var params = req.params.all();

    if (params.script_arguments) {
      params.script_arguments = params.script_arguments
        .split(',')
        .map(arg => arg.trim());
    }

    supervisor.create({
      route: supervisor.RESOURCE,
      body: params,
      failure: error => res.send(error.statusCode, error),
      success: monitors => res.json(monitors),
    });
  },
  /**
   * Edit resource
   * PUT /resource
   */
  update : function(req,res,next) {
    var supervisor = req.supervisor;
    var params = req.params.all();

    if (params.script_arguments) {
      params.script_arguments = params.script_arguments
        .split(',')
        .map(arg => arg.trim());
    }

    supervisor.patch({
      id: params.id,
      route: supervisor.RESOURCE,
      body: params,
      failure: error => res.send(error.statusCode, error),
      success: resource => res.json(resource),
    });
  },
  /**
   * Get resource
   * GET /resource
   */
  get (req,res) {
    req.supervisor.get({
      query: req.query,
      route: req.supervisor.RESOURCE,
      id: req.params.id,
      failure: (error, apiRes) => res.send(error.statusCode, error),
      success: (body, apiRes) => res.json(body),
    });
  },
  updateAlerts: function(req,res) {
    var supervisor = req.supervisor;
    var id = req.param("id", null);
    var value = toBoolean(req.param('enable'));

    if(value===null){
      return res.send(400,'invalid alerts value');
    }

    var data = { 'alerts': value.toString() };
    supervisor.patch({
      id: req.params.id,
      route: supervisor.RESOURCE,
      child: 'alerts',
      body: data,
      failure: error => res.send(500, error),
      success: resource => res.send(200,{ resource: resource })
    });
  }
};
