'use strict';

var CLIENT_VERSION = 'v0.9.8'
var CLIENT_NAME = 'Golum'
var CLIENT_USER_AGENT = CLIENT_NAME + '/' + CLIENT_VERSION
var os = require('os')
var fs = require('fs')
var path = require('path')
var util = require('util')
var request = require('request')
var debug = require('debug')
var logger = {
  'debug': debug('eye:client:debug'),
  'error': debug('eye:client:error')
}


module.exports = TheEyeClient

/**
 *
 *
 */
function TheEyeClient (options) {
  this.access_token = '';
  this.configure(options);
  return this;
}

/**
 *
 *
 */
TheEyeClient.prototype = {
  TASK: '/:customer/task',
  TAG: '/:customer/tag',
  RESOURCE: '/:customer/resource',
  MONITORS: '/:customer/monitor',
  EVENTS: '/:customer/event',
  JOB: '/:customer/job',
  SCRIPT: '/:customer/script',
  /**
   *
   * @author Facundo
   * @return undefined
   * @param Object options
   *
   */
  configure: function(options) {
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

    if( !error && /20./.test(httpResponse.statusCode) ) {
      return callNext(null,body);
    } else if( error ){
      return callNext(error);
    } else if( httpResponse ) {
      if( httpResponse.statusCode == 401 ) {

        // AuthError Unauthorized
        var msg = 'request authentication error. access denied.';
        var err = new Error(msg);
        logger.error(err);

        connection.refreshToken(function(error, token) {
          if(error) logger.error(error.message);
          callNext(error, body);
        });

      } else {
        var message ;

        if( /40./.test(httpResponse.statusCode) ) {

          message='client error';

        } else if( /50./.test(httpResponse.statusCode) ){

          message='server error';

        } else {

          message='unknown request error';

          logger.error('############ UNKNOWN ERROR ############');
          logger.error('REQUEST > %s' , JSON.stringify(request) );
          logger.error('STATUS  > %s' , httpResponse.statusCode );
          logger.error('ERROR   > %j' , error );
          logger.error('BODY    > %j' , JSON.stringify(body) );
          logger.error('#######################################');

        }

        var error = new Error(!body?message:(body.message||body));
        error.body = body;
        error.statusCode = httpResponse.statusCode||504;
        return callNext(error, body);
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
  create : function(options) {
    var request = this.performRequest({
      method: 'POST',
      url: options.route,
      formData: options.formData||undefined,
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
    var url = options.route;
    if( options.id ) url += '/' + options.id;
    if( options.child ) url += '/' + options.child;

    var request = this.performRequest({
      method: 'PUT',
      url: url,
      formData: options.formData||undefined,
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
      formData: options.formData||undefined,
      body: options.body||undefined,
      qs: options.query||undefined
    },function(error, body){
      if(error) options.failure(error,request);
      else options.success(body,request);
    });
    return request;
  },
  //
  //
  // DEPRECATED VERY SOON
  //
  //
  tags: function(callback){
    this.performRequest({ method: 'get', url: this.TAG }, function(error,body){
      callback(error, body);
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
  scriptDownloadStream : function(scriptId) {
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
   * @param {Object} readStream - A script readable stream
   * @param {Object} options - script properties.
   *   - param {String} description
   *   - param {String} filename
   * @param {Function} callback
   */
  createScript: function(readStream, options, callback){
    return this.performRequest({
      method: 'post',
      url: '/:customer/script',
      formData: {
        public: (options.public||false),
        description: (options.description||''),
        script: {
          value: readStream,
          options: {
            filename: options.filename
          }
        }
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
  patchScript: function(id, stream, options, callback) {
    this.performRequest({
      method: 'patch',
      uri: '/:customer/script/' + id,
      formData: {
        public: (options.public||false),
        description: options.description,
        script: {
          value: stream,
          options: {
            filename: options.filename
          }
        },
      }
    }, function(error, body) {
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
   */
  host: function(id, callback){
    this.performRequest({
      method: 'get',
      url: '/:customer/host/' + id
    }, function(error, body) {
      if (error) return callback(error);
      callback(null, body);
    });
  },
  /**
   */
  hosts: function(callback) {
    this.performRequest({
      method: 'get',
      url: '/:customer/host'
    }, function(error, body) {
      if (error) return callback(error);
      callback(null, body);
    });
  },
  /**
   */
  userDelete : function (id, callback) {
    this.performRequest({
      method: 'delete',
      uri: '/user/' + id
    }, function(error, body) {
      if (error) return callback(error);
      callback(null, body);
    });
  }
}
