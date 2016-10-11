'use strict';

var CLIENT_VERSION = 'v0.9.8' ;

var CLIENT_NAME = 'Golum' ;

var CLIENT_USER_AGENT = CLIENT_NAME + '/' + CLIENT_VERSION ;

var os = require('os');
var fs = require('fs');
var path = require('path');
var util = require('util');
var request = require('request');
var debug = require('debug');
var EventEmitter = require('events').EventEmitter;

var logger = {
  'debug': debug('eye:client:debug'),
  'error': debug('eye:client:error')
};


module.exports = TheEyeClient;

/**
 *
 *
 */
function TheEyeClient (options)
{
  this.access_token = '';

  this.configure(options);

  EventEmitter.call(this);

  return this;
}

util.inherits(TheEyeClient, EventEmitter);

/**
 *
 *
 */
var prototype = {
  TASK: '/:customer/task',
  TAG: '/:customer/tag',
  RESOURCE: '/:customer/resource',
  EVENTS: '/:customer/event',
  JOB: '/:customer/job',
  /**
   *
   * @author Facundo
   * @return undefined
   * @param Object options
   *
   */
  configure: function(options)
  {
    var connection = this;

    logger.debug('theeye api client version %s/%s', CLIENT_NAME, CLIENT_VERSION);

    for(var prop in options) connection[prop] = options[prop];

    connection.api_url = options.api_url||process.env.THEEYE_SUPERVISOR_API_URL ;
    connection.client_id = options.client_id||process.env.THEEYE_SUPERVISOR_CLIENT_ID ;
    connection.client_secret = options.client_secret||process.env.THEEYE_SUPERVISOR_CLIENT_SECRET ;
    connection.client_customer = options.client_customer||process.env.THEEYE_SUPERVISOR_CLIENT_CUSTOMER ;
    connection.access_token = options.access_token||null ;

    logger.debug('connection properties => %o', connection);
    if( ! connection.api_url ) {
      return logger.error('ERROR. supervisor API URL required');
    }

    connection.request = request.defaults({
      proxy: process.env.http_proxy,
      tunnel: false,
      timeout: 5000,
      json: true,
      gzip: true,
      headers: {
        'User-Agent': CLIENT_USER_AGENT
      },
      baseUrl: connection.api_url
    });
  },
  /**
   *
   * @author Facundo
   * @return undefined
   * @param Function next
   *
   */
  refreshToken : function(next) {
    next||(next=function(){});
    var connection = this;

    if(!this.client_id || !this.client_secret){
      logger.debug('no credentials!');
      var error = new Error('no credential provided. client_id & client_secret required');
      return next(error);
    }

    logger.debug('sending new authentication request');

    this.request.post({
      'baseUrl' : this.api_url,
      'url': '/token' ,
      'auth': {
        'user' : this.client_id,
        'pass' : this.client_secret,
        'sendImmediately' : true
      }
    }, function(error,httpResponse,token) {
      if(error) {
        logger.error('unable to get new Token');
        return next(error);
      } else if( httpResponse.statusCode == 200 ){
        logger.debug('successful token refresh %s', JSON.stringify(token));
        connection.access_token = token;

        return next(null, token);
      } else {
        var message = 'token refresh failed ' + JSON.stringify(token);
        logger.error(message);
        return next(new Error(message),null);
      }
    });
  },
  /**
   * handle response data and errors
   * @author Facundo
   */
  processResponse : function(
    request,
    error,
    httpResponse,
    body,
    next
  ){
    var connection = this;

    var callNext = function(error, body){
      if(next) next(error, body, httpResponse);
    }

    if( ! error && /20./.test( httpResponse.statusCode ) )
    {
      logger.debug('%s %s request success', request.method, request.url);
      callNext(null,body);
    }
    else // error condition detected
    {
      logger.error('error detected on %s %s', request.method, request.url);
      logger.error(request);
      if(error)
      {
        // could not send data to server
        logger.error('request failed : %s', JSON.stringify(request) );
        logger.error(error.message);
        error.statusCode = httpResponse ? httpResponse.statusCode : null;
        logger.error(body);
        callNext(error, body);
      }
      else if( httpResponse.statusCode == 401 )
      {
        // unauthorized
        logger.error('access denied');
        connection.refreshToken(function(error, token) {
          if(error) {
            logger.error('client could not be authenticated');
            logger.error(error.message);
            error.statusCode = httpResponse.statusCode;
            //throw new Error('agent could not be authenticated');
          }
          callNext(error, body);
        });
      }
      else if(
        (body && body.status == 'error')
        || /40./.test( httpResponse.statusCode )
      ) {
        body||(body={});
        logger.error( JSON.stringify(body) );
        var error = new Error(body.message||'client error');
        error.data = body;
        error.statusCode = httpResponse.statusCode ;
        callNext(error,body);
      }
      else
      {
        logger.error('>>>>>>>>>>>> unhandled error! <<<<<<<<<<<<');
        logger.error('request %s' , JSON.stringify(request) );
        logger.error('status  %s' , httpResponse.statusCode );
        logger.error('error   %s' , error && error.message  );
        logger.error('body    %s' , JSON.stringify(body)    );
        logger.error('>>>>>>>>>>>>>>>>>>>> * <<<<<<<<<<<<<<<<<<<');

        if(!error) {
          error = new Error(JSON.stringify(body));
          error.statusCode = httpResponse.statusCode;
        }

        callNext(error, body);
      }
    }
  },
  /**
   * prepare the request to be sent.
   * append auth data and mandatory parameters
   * @author Facundo
   * @return {Object} Request
   */
  performRequest : function(options, doneFn){
    try {
      var connection = this;
      doneFn||(doneFn=function(){});
      var hostname = this.hostname;
      var customer = this.client_customer;

      var prepareUri = function(options){
        var uri = options.uri||options.url;
        uri = uri.replace(':hostname',hostname);
        uri = uri.replace(':customer',customer);
        return uri;
      }

      var prepareQueryString = function(options){
        // add customer to the qs if not present elsewhere
        var qs = options.qs||{};
        var uri = options.uri||options.url;
        var customer = qs.customer || /:customer/.test(uri) !== false;
        if(!customer) {
          if( connection.client_customer ) {
            qs.customer = connection.client_customer;
          }
        }
        return qs;
      }

      options.qs = prepareQueryString(options);
      options.uri = options.url = prepareUri(options);

      // set authentication method if not provided
      if( ! options.auth ) {
        if( connection.access_token ) {
          options.auth = { bearer : connection.access_token } ;
        }
      }

      var msg = 'requesting %s';
      msg += options.qs ? ' qs: %o' : '';
      logger.debug(msg, options.url, options.qs || '');

      var requestDoneFn = function(error, httpResponse, body){
        connection.processResponse(
          options,
          error,
          httpResponse,
          body,
          doneFn
        );
      }

      return connection.request(options, requestDoneFn);
    } catch (e) {
      logger.error('request could not be completed');
      logger.error(e);
      doneFn(e);
    }
  },
  /**
   * get request wrapper
   * @author Facundo
   * @return Request connection.request
   */
  get: function(options) {
    var url = options.route;
    if( options.id ) url += '/' + options.id;
    if( options.child ) url += '/' + options.child;

    var request = this.performRequest({
      method: 'GET',
      url: url,
      qs: options.query||undefined
    },function(error, body){
      if(error) options.failure(error,request);
      else options.success(body,request);
    });
    return request;
  },
  /**
   * get fetch request wrapper
   * @author Facundo
   * @return Request connection.request
   */
  fetch: function(options){
    var url = options.route;
    var request = this.performRequest({
      method: 'GET',
      url: url,
      qs: options.query||undefined
    },function(error, body){
      if(error) options.failure(error,request);
      else options.success(body,request);
    });
    return request;
  },
  /**
   * delete request wrapper
   * @author Facundo
   * @return Request connection.request
   */
  remove : function(options) {
    var url = options.route;
    if( options.id ) url += '/' + options.id;
    if( options.child ) url += '/' + options.child;

    var request = this.performRequest({
      method: 'DELETE',
      url: url,
      qs: options.query||undefined
    }, function(error, body){
      if(error) options.failure(error, request);
      else options.success(body, request);
    });
  },
  /**
   * post request wrapper
   * @author Facundo
   * @return Request connection.request
   */
  create: function(options) {
    var request = this.performRequest({
      method: 'POST',
      url: options.route,
      body: options.body||undefined,
      qs: options.query||undefined
    },function(error, body){
      if(error) options.failure(error,request);
      else options.success(body,request);
    });
    return request;
  },
  /**
   * put request wrapper
   * @author Facundo
   * @return Request connection.request
   */
  update : function(options) {
    var request = this.performRequest({
      method: 'PUT',
      url: options.route + '/' + options.id,
      body: options.body||undefined,
      qs: options.query||undefined
    },function(error, body){
      if(error) options.failure(error,request);
      else options.success(body,request);
    });
    return request;
  },
  /**
   * patch request wrapper
   * @author Facundo
   * @return Request connection.request
   */
  patch : function(options) {
    var url = options.route;
    if( options.id ) url += '/' + options.id;
    if( options.child ) url += '/' + options.child;

    var request = this.performRequest({
      method: 'PATCH',
      url: url,
      body: options.body||undefined,
      qs: options.query||undefined
    },function(error, body){
      if(error) options.failure(error,request);
      else options.success(body,request);
    });
    return request;
  },
  /**
   *
   *
   *
   * agent methods
   *
   *
   *
   */
  getNextPendingJob : function(options,doneFn) {

    var hostname = (options && options.hostname) ? options.hostname : this.hostname;

    this.performRequest({
      method: 'GET',
      url: '/:customer/job',
      qs: {
        process_next: 1,
        hostname: hostname
      }
    }, function(error,body){
      if( ! error ) {
        if(body&&body.jobs) {
          if(Array.isArray(body.jobs)&&body.jobs.length>0){
            doneFn(null, body.jobs[0]);
          }
          else doneFn();
        } else {
          var error = new Error('api response with empty content.');
          logger.error(error);
          doneFn(error);
        }
      } else {
        logger.error('api request error %s.',error);
        logger.error(error);
      }
    });
  },
  /**
   *
   *
   */
  sendAgentKeepAlive : function() {
    this.performRequest({
      method:'put',
      url: '/:customer/agent/:hostname'
    });
  },
  /**
   *
   *
   */
  submitJobResult : function(jobId,result,next) {
    this.performRequest({
      method: 'PUT',
      url: '/:customer/job/' + jobId,
      body: {result:result}
    }, function(error,response){
      if( error ) {
        logger.error('unable to update job');
        if(next) next(error);
      } else {
        logger.debug('job updated');
        if(next) next(null,response);
      }
    });
  },
  /**
   *
   *
   */
  submitDstat : function(dstat,next) {
    this.performRequest({
      url: '/:customer/dstat/:hostname',
      method: 'post',
      body: dstat
    }, next);
  },
  /**
   *
   *
   */
  submitPsaux : function(psaux,next) {
    this.performRequest({
      method: 'post',
      body: psaux,
      url: '/psaux/:hostname'
    }, next);
  },
  /**
   *
   *
   */
  registerAgent : function(data,next) {
    this.performRequest({
      url:'/host/:hostname',
      body:data,
      method:'post'
    }, next);
  },
  /**
   *
   *
   */
  getAgentConfig: function(hostname, next) {
    this.performRequest({
      method:'get',
      url:  '/:customer/agent/:hostname/config'
    },function(error,body){
      if( error ) {
        logger.error('request error');
        logger.error(error.message);
        next(error,null);
      } else {
        if( ! body || ! body instanceof Object ) {
          logger.error('respose body error. no config found');
          logger.error(body);
          next(error,null);
        } else {
          logger.debug('agent config fetch success');
          logger.debug('%j', body);
          next(null,body);
        }
      }
    });
  },
  //
  //
  //
  //  admin resources operations
  //
  //
  //
  tags: function(callback){
    this.performRequest({ method: 'get', url: this.TAG }, function(error,body){
      callback(error, body);
    });
  },
  /**
   * Gets a script by its Id
   *
   * @param {Number} id - The script id in supervisor
   * @param {Function} callback - Called with the scripts as second parameter.
   *   - param {Error} error - Null if nothing bad happened.
   *   - param {Array} scripts - Array of script objects.
   */
  script: function(id, callback) {
    this.performRequest({
      method: 'get',
      url: '/:customer/script/' + id
    }, function(error, body) {
      if (error) return callback(error);
      callback(null, body.script);
    });
  },
  /**
   *
   * Gets available scripts for customer and username
   *
   * @param {Number} id - The script id in supervisor
   * @param {Function} callback - Called with the scripts as second parameter.
   *   - param {Error} error - Null if nothing bad happened.
   *   - param {Array} scripts - Array of script objects.
   */
  scripts: function(callback) {
    this.performRequest({
      method: 'get',
      url: '/:customer/script'
    }, function(error, body) {
      if (error) return callback(error);
      callback(null, body.scripts);
    });
  },
  /**
   *
   * Download the script file with a strem.
   * Returns the stream to persist in local storage.
   *
   * @author Facundo
   * @param {Integer} script id
   * @return {Stream} downloaded file stream
   *
   */
  scriptDownloadStream : function(scriptId)
  {
    return this.performRequest({
      method: 'get',
      url: '/:customer/script/' + scriptId  + '/download'
    })
    .on('response', function(response) {
      if(response.statusCode != 200) {
        var error = new Error('get script response error ' + response.statusCode);
        this.emit('error', error);
      }
    });
  },
  /**
   * Gets a script file by its Id
   *
   * @param {Number} id - The script id in supervisor
   * @param {Function} callback - Called with the scripts as second parameter.
   *   - param {Error} error - Null if nothing bad happened.
   *   - param {scriptFile} - base64 encode file
   */
  scriptDownload : function(id, callback) {
    var url = path.join();
    this.performRequest({
      method: 'get',
      uri: '/:customer/script/' + id + '/download'
    },function(error, body) {
      if (error) return callback(error);
      callback(null, body);
    });
  },

  /**
   * Creates a Script
   *
   * @param {Object} script - A descriptor for the file that is going to be uploaded.
   *   - param {String} fd - Local filepath .
   *   - param {String} filename - Script filename .
   * @param {Object} options - script properties.
   *   - param {String} description - Script description.
   * @param {Function} callback - Called with the task as second parameter.
   *   - param {Error} error - Null if nothing bad happened.
   *   - param {Array} script - The new script object.
   */
  createScript: function(script, options, callback) {
    this.performRequest({
      method: 'post',
      url: '/:customer/script',
      formData: {
        description : options.description || '',
        script: {
          value: fs.createReadStream(script.fd),
          options: {
            filename: options.filename || script.filename
          }
        },
        public: options.public || false
      }
    }, function(error, body) {
      if (error) return callback(error);
      callback(null, body);
    });
  },
  /**
   * Deletes a Script
   */
  deleteScript: function(id, callback) {
    this.performRequest({
      method: 'delete',
      uri: '/:customer/script/' + id
    }, function(error, body) {
      if (error) return callback(error);
      callback(null, body);
    });
  },
  /**
   * Patch a Script
   */
  patchScript: function(id, script, options, callback) {
    this.performRequest({
      method: 'patch',
      uri: '/:customer/script/' + id,
      formData: {
        description : options.description,
        script: {
          value: fs.createReadStream(script.fd),
          options: {
            filename: options.filename || script.filename
          }
        },
        public: options.public || false
      }
    }, function(error, body) {
      if (error) return callback(error);
      callback(null, body);
    });
  },
  /**
   * Get a Task
   *
   * @param {Number} id - The script id in supervisor
   * @param {Function} callback - Called with the scripts as second parameter.
   */
  task: function(id, callback) {
    this.performRequest({
      method: 'get',
      uri: this.TASK + '/' + id
    }, function(error, body) {
      if (error) return callback(error);
      callback(null, body);
    });
  },
  /**
   * Gets Tasks
   *
   * @param {Number} id - The task id in supervisor
   * @param {Function} callback - Called with the tasks as second parameter.
   *   - param {Error} error - Null if nothing bad happened.
   *   - param {Array} tasks - Array of task objects.
   */
  tasks: function(callback) {
    this.performRequest({
      method: 'get',
      url: this.TASK,
    }, function(error, tasks) {
      if (error) return callback(error);
      callback(null, tasks);
    });
  },
  /**
   *
   *
   */
  deleteTask: function(task_id, callback) {
    this.performRequest({
      method: 'delete',
      uri: this.TASK + '/' + task_id
    }, function(error, body) {
      if (error) return callback(error);
      callback(null, body);
    });
  },
  /**
   *
   *
   */
  jobCreate: function(task_id, callback) {
    this.performRequest({
      method: 'POST',
      uri: '/:customer/job',
      qs: { task: task_id }
    }, function(error, body) {
      if (error) return callback(error);
      callback(null, body.job);
    });
  },
  /**
   * Task schedule POST
   */
  scheduleTask: function(data, callback){
    this.performRequest({
      method: 'POST',
      uri: '/:customer/task/schedule',
      body: data,
      json: true
    }, function(error, body){
      if (error) return callback(error);
      callback(null, body);
    });
  },
  /**
   * Task schedule GET
   */
  getTaskSchedule: function(task_id, callback){
    this.performRequest({
      method: 'GET',
      uri: '/:customer/task/' + task_id + '/schedule'
    }, function(error, body){
      if (error) return callback(error);
      callback(null, body);
    });
  },
  /**
   *
   * @param {Object} query
   *    @property {String} resource , resource id
   *    @property {String} type
   *
   */
  monitorFetch: function(options, callback) {
    this.performRequest({
      method: 'get',
      url: '/monitor',
      qs: {
        type: options.type,
        resource: options.resource
      }
    }, function(error, body) {
      if (error) return callback(error);
      callback(null, body.monitors);
    });
  },
  /**
   *
   *
   */
  monitorGet : function(id, callback) {
    this.performRequest({
      method: 'get',
      uri: '/monitor/' + id
    }, function(error, body) {
      if (error) return callback(error);
      callback(null, body.monitor);
    });
  },
  /**
   *
   *
   */
  resource: function(id, callback) {
    this.performRequest({
      method: 'get',
      url: '/:customer/resource/' + id
    }, function(error, body) {
      if (error) return callback(error);
      callback(null, body.resource);
    });
  },
  /**
   *
   *
   */
  deleteResource : function(id, callback) {
    this.performRequest({
      method: 'delete',
      url: '/:customer/resource/' + id
    }, function(error, body) {
      if (error) return callback(error);
      callback(null, body);
    });
  },
  /**
   *
   *
   */
  updateResource : function(id,resourceUpdates,next) {
    this.performRequest({
      method: 'PUT',
      url: '/:customer/resource/' + id,
      body: resourceUpdates
    }, function(error,response){
      if( error ) {
        logger.error('unable to update resource');
        logger.error(error.message);
        if(next) next(error);
      } else {
        logger.debug('resource updated');
        if(next) next(null,response);
      }
    });
  },
  /**
   *
   *
   */
  resourceTypes: function(callback) {
    this.performRequest({
      method: 'get',
      url: '/:customer/resource/type'
    }, function(error, body) {
      if (error) return callback(error);
      callback(null, body.types);
    });
  },
  /**
   *
   *
   */
  host: function(id, callback){
    this.performRequest({
      method: 'get',
      url: '/host/' + id
    }, function(error, body) {
      if (error) return callback(error);
      callback(null, body.host);
    });
  },
  /**
   *
   *
   */
  hosts: function(callback) {
    this.performRequest({
      method: 'get',
      url: '/host'
    }, function(error, body) {
      if (error) return callback(error);
      callback(null, body.hosts);
    });
  },
  /**
   *
   *
   */
  hostStats: function(id, callback){
    this.performRequest({
      method: 'get',
      url: '/host/'+ id + '/stats'
    }, function(error, body) {
      if (error) return callback(error);
      callback(null, body.stats);
    });
  },
  /**
   *
   *
   */
  scraperHosts: function(callback) {
    this.performRequest({
      method: 'get',
      url: '/host',
      qs: {
        scraper: true
      }
    }, function(error, body) {
      if (error) return callback(error);
      callback(null, body.hosts);
    });
  },
  /**
   *
   *
   */
  customerFetch : function(filters, callback) {
    this.performRequest({
      method: 'get',
      url: '/customer'
    }, function(error, body) {
      if (error) return callback(error);
      callback(null, body.customers);
    });
  },
  /**
   *
   *
   */
  customerGet : function(customerId, callback) {
    this.performRequest({
      method: 'get',
      url: '/customer/' + customerId
    }, function(error, body) {
      if (error) return callback(error);
      callback(null, body.customer);
    });
  },
  /**
   *
   *
   */
  customerCreate : function(data, callback) {
    this.performRequest({
      method: 'post',
      url: '/customer',
      body: data
    }, function(error, body) {
      if (error) return callback(error);
      callback(null, body.customer);
    });
  },
  /**
   * Replace customer data
   * @method PUT
   * @route /customer/:customer
   */
  customerReplace : function(customerId, data, callback) {
    this.performRequest({
      method: 'put',
      url: '/customer/' + customerId,
      body: data
    }, function(error, body){
      if (error) return callback(error);
      callback(null, body.customer);
    });
  },
  /**
   * Update customer data
   * @method PATCH
   * @route /customer/:customer
   */
  customerUpdate : function(customerId, data, callback) {
    this.performRequest({
      method: 'patch',
      url: '/customer/' + customerId,
      body: data
    }, function(error, body){
      if (error) return callback(error);
      callback(null, body.customer);
    });
  },
  /**
   *
   *
   */
  customerRemove : function(customerId, callback) {
    this.performRequest({
      method: 'delete',
      url: '/customer/' + customerId
    }, function(error, body){
      if (error) return callback(error);
      callback(null);
    });
  },
  /**
   *
   *
   */
  userGet : function(id, callback) {
    this.performRequest({
      method: 'get',
      url: '/user/' + id
    }, function(error, body) {
      if (error) return callback(error);
      callback(null, body.user);
    });
  },
  /**
   *
   *
   */
  userFetch : function(query, callback) {
    var filters = {};

    if(query.customer) filters.customer = query.customer;
    if(query.credential) filters.credential = query.credential;

    this.performRequest({
      method: 'get',
      url: '/user',
      qs: filters
    }, function(error, body) {
      if (error) return callback(error);
      callback(null, body.users);
    });
  },
  /**
   *
   *
   */
  userCreate : function(data, callback) {
    this.performRequest({
      method: 'post',
      url: '/user',
      body: data
    }, function(error, body) {
      if (error) return callback(error);
      callback(null, body.user);
    });
  },
  /**
   *
   *
   */
  userReplace : function (id, updates, callback) {
    this.performRequest({
      method: 'put',
      url: '/user/' + id,
      body:  updates
    }, function(error, body){
      if (error) return callback(error);
      callback(null, body.user);
    });
  },
  /**
   *
   *
   */
  userUpdate : function (id, updates, callback) {
    var body = {
      'customers' : updates.customers ,
      'credential': updates.credential ,
      'enabled' : updates.enabled
    };

    this.performRequest({
      method: 'patch',
      uri: '/user/' + id,
      body: body
    }, function(error, body) {
      if (error) return callback(error);
      callback(null, body.user);
    });
  },
  /**
   * @author Facundo
   */
  userDelete : function (id, callback) {
    this.performRequest({
      method: 'delete',
      uri: '/user/' + id
    }, function(error, body) {
      if (error) return callback(error);
      callback(null, body);
    });
  },
  /**
   *
   * HostGroup endpoint
   * @author Facundo
   *
   */
  hostgroupFetch : function(options, callback){
    this.performRequest({
      method: 'get',
      url: '/:customer/hostgroup',
    }, function(error, body) {
      if(error) return callback(error);
      callback(null, body.groups);
    });
  },
  hostgroupCreate : function(data, callback){
    this.performRequest({
      method: 'post',
      url: '/:customer/hostgroup',
      body: data
    }, function(error, body) {
      if(error) return callback(error);
      callback(null, body.group);
    });
  },
  hostgroupDelete : function(id, callback){
    this.performRequest({
      method: 'delete',
      url: '/:customer/hostgroup/' + id,
    }, function(error, body) {
      if(error) return callback(error);
      callback(null, body);
    });
  },
  hostgroupGet : function(id, callback){
    this.performRequest({
      method: 'get',
      url: '/:customer/hostgroup/' + id,
    }, function(error, body) {
      if(error) return callback(error);
      callback(null, body.group);
    });
  },
  /**
   * host group subresource task template.
   *
   * access and updates a specific group task-template.
   *
   * @author Facundo
   * @method PUT
   * @param {Integer} groupid
   * @param {Integer} taskid
   * @param {Object} updates
   * @param {Function} callback
   *
   **/
  hostgrouptasktemplateUpdate: function(groupid, taskid, updates, callback){
    this.performRequest({
      method: 'put',
      uri: '/:customer/hostgroup/' + groupid + '/tasktemplate/' + taskid,
      body: updates
    },function(error, body){
      if(error) return callback(error);
      callback(null, body.task);
    });
  },
  /*
   * add a new task to a group
   */
  hostgrouptasktemplateCreate: function(groupid, task, callback){
    this.performRequest({
      method: 'post',
      uri: '/:customer/hostgroup/' + groupid + '/tasktemplate',
      body: task
    },function(error, body){
      if(error) return callback(error);
      callback(null, body.task);
    });
  },
  /**
   *
   */
  hostgrouptasktemplateDelete: function(groupid, taskid, callback){
    this.performRequest({
      method: 'delete',
      uri: '/:customer/hostgroup/' + groupid + '/tasktemplate/' + taskid,
    },function(error){
      if(error) return callback(error);
      callback(null);
    });
  },
  /**
   * host group subresource monitor template.
   *
   * access and updates a specific group monitor-template.
   *
   * @author Facundo
   * @method PUT
   * @param {Integer} groupid
   * @param {Integer} monitorid
   * @param {Object} updates
   * @param {Function} callback
   *
   **/
  hostgroupmonitortemplateUpdate: function(groupid, monitorid, updates, callback){
    this.performRequest({
      method: 'put',
      uri: '/:customer/hostgroup/' + groupid + '/monitortemplate/' + monitorid,
      body: updates
    },function(error, body){
      if(error) return callback(error);
      callback(null, body.monitor);
    });
  },
  /**
   * add a new monitor to a group
   * @method POST
   * @param {Integer} groupid
   * @param {Integer} monitor
   * @param {Function} callback
   */
  hostgroupmonitortemplateCreate: function(groupid, monitor, callback){
    this.performRequest({
      method: 'post',
      uri: '/:customer/hostgroup/' + groupid + '/monitortemplate',
      body: monitor
    },function(error, body){
      if(error) return callback(error);
      callback(null, body.monitor);
    });
  },
  /**
   *
   */
  hostgroupmonitortemplateDelete: function(groupid, monitorid, callback){
    this.performRequest({
      method: 'delete',
      uri: '/:customer/hostgroup/' + groupid + '/monitortemplate/' + monitorid,
    },function(error){
      if(error) return callback(error);
      callback(null);
    });
  },
}

for(var p in prototype) {
  TheEyeClient.prototype[p] = prototype[p];
}
