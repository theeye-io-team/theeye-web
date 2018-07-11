/**
 * sails.io.js
 * ------------------------------------------------------------------------
 * JavaScript Client (SDK) for communicating with Sails.
 *
 * Note that this script is completely optional, but it is handy if you're
 * using WebSockets from the browser to talk to your Sails server.
 *
 * For tips and documentation, visit:
 * http://sailsjs.org/#!documentation/reference/BrowserSDK/BrowserSDK.html
 * ------------------------------------------------------------------------
 *
 * This file allows you to send and receive socket.io messages to & from Sails
 * by simulating a REST client interface on top of socket.io. It models its API
 * after the $.ajax pattern from jQuery you might already be familiar with.
 *
 * So if you're switching from using AJAX to sockets, instead of:
 *    `$.post( url, [data], [cb] )`
 *
 * You would use:
 *    `socket.post( url, [data], [cb] )`
 */
// Constants
const CONNECTION_METADATA_PARAMS = {
  version: '__sails_io_sdk_version',
  platform: '__sails_io_sdk_platform',
  language: '__sails_io_sdk_language'
}

// Current version of this SDK (sailsDK?!?!) and other metadata
// that will be sent along w/ the initial connection request.
const SDK_INFO = {
  version: '0.10.0', // TODO: pull this automatically from package.json during build.
  platform: typeof module === 'undefined' ? 'browser' : 'node',
  language: 'javascript'
}

SDK_INFO.versionString =
  CONNECTION_METADATA_PARAMS.version + '=' + SDK_INFO.version + '&' +
  CONNECTION_METADATA_PARAMS.platform + '=' + SDK_INFO.platform + '&' +
  CONNECTION_METADATA_PARAMS.language + '=' + SDK_INFO.language

module.exports = function (io) {

  // If the socket.io client is not available, none of this will work.
  if (!io) {
    let msg = '`sails.io.js` requires a socket.io client, but `io` was not found.'
    throw new Error(msg)
  }

  // Create a private logger instance
  var consolog = LoggerFactory()
  consolog.noPrefix = LoggerFactory({ prefix: false })

  var Socket = io.SocketNamespace

  /**
   * Simulate a GET request to sails
   * e.g.
   *    `socket.get('/user/3', Stats.populate)`
   *
   * @api public
   * @param {String} url    ::    destination URL
   * @param {Object} params ::    parameters to send with the request [optional]
   * @param {Function} cb   ::    callback function to call when finished [optional]
   */
  Socket.prototype.get = function(url, data, cb) {
    // `data` is optional
    if (typeof data === 'function') {
      cb = data;
      data = {};
    }

    return this._request({
      method: 'get',
      data: data,
      url: url
    }, cb);
  }

  /**
   * Simulate a POST request to sails
   * e.g.
   *    `socket.post('/event', newMeeting, $spinner.hide)`
   *
   * @api public
   * @param {String} url    ::    destination URL
   * @param {Object} params ::    parameters to send with the request [optional]
   * @param {Function} cb   ::    callback function to call when finished [optional]
   */
  Socket.prototype.post = function(url, data, cb) {
    // `data` is optional
    if (typeof data === 'function') {
      cb = data;
      data = {};
    }

    return this._request({
      method: 'post',
      data: data,
      url: url
    }, cb);
  }

  /**
   * Simulate a PUT request to sails
   * e.g.
   *    `socket.post('/event/3', changedFields, $spinner.hide)`
   *
   * @api public
   * @param {String} url    ::    destination URL
   * @param {Object} params ::    parameters to send with the request [optional]
   * @param {Function} cb   ::    callback function to call when finished [optional]
   */
  Socket.prototype.put = function(url, data, cb) {
    // `data` is optional
    if (typeof data === 'function') {
      cb = data;
      data = {};
    }

    return this._request({
      method: 'put',
      data: data,
      url: url
    }, cb);
  }

  /**
   * Simulate a DELETE request to sails
   * e.g.
   *    `socket.delete('/event', $spinner.hide)`
   *
   * @api public
   * @param {String} url    ::    destination URL
   * @param {Object} params ::    parameters to send with the request [optional]
   * @param {Function} cb   ::    callback function to call when finished [optional]
   */
  Socket.prototype['delete'] = function(url, data, cb) {
    // `data` is optional
    if (typeof data === 'function') {
      cb = data;
      data = {};
    }

    return this._request({
      method: 'delete',
      data: data,
      url: url
    }, cb);
  }

  /**
   * Simulate an HTTP request to sails
   * e.g.
   *    `socket.request('/user', newUser, $spinner.hide, 'post')`
   *
   * @api public
   * @param {String} url    ::    destination URL
   * @param {Object} params ::    parameters to send with the request [optional]
   * @param {Function} cb   ::    callback function to call when finished [optional]
   * @param {String} method ::    HTTP request method [optional]
   */
  Socket.prototype.request = function(url, data, cb, method) {
    // `cb` is optional
    if (typeof cb === 'string') {
      method = cb;
      cb = null;
    }

    // `data` is optional
    if (typeof data === 'function') {
      cb = data;
      data = {};
    }

    return this._request({
      method: method || 'get',
      data: data,
      url: url
    }, cb);
  }

  /**
   * Socket.prototype._request
   *
   * Simulate HTTP over Socket.io.
   *
   * @api private
   * @param  {[type]}   options [description]
   * @param  {Function} cb      [description]
   */
  Socket.prototype._request = function (options, cb) {
    // Sanitize options (also data & headers)
    var usage = 'Usage:\n socket.' +
      (options.method || 'request') +
      '( destinationURL, [dataToSend], [fnToCallWhenComplete] )'

    options = options || {};
    options.data = options.data || {};
    options.headers = options.headers || {};

    // Remove trailing slashes and spaces to make packets smaller.
    options.url = options.url.replace(/^(.+)\/*\s*$/, '$1');
    if (typeof options.url !== 'string') {
      throw new Error('Invalid or missing URL!\n' + usage);
    }

    // Build a simulated request object.
    var request = {
      method: options.method,
      data: options.data,
      url: options.url,
      headers: options.headers,
      cb: cb
    }

    if (!_isConnected(this)) { return; }

    _emitFrom(this, request)
  }

  /**
   * @param  {String} url  [optional]
   * @param  {Object} opts [optional]
   * @return {Socket}
   */
  const _connect = (url, opts) => {
    opts = opts || {};

    // Ensure URL has no trailing slash
    url = url ? url.replace(/(\/)$/, '') : undefined;

    // Mix the current SDK version into the query string in
    // the connection request to the server:
    if (typeof opts.query !== 'string') opts.query = SDK_INFO.versionString;
    else opts.query += '&' + SDK_INFO.versionString;

    return io.connect(url, opts);
  }

  const goAheadAndActuallyConnect = (url, next) => {
    // Initiate a socket connection
    const socket = _connect(url)

    /**
     * 'connect' event is triggered when the socket establishes a connection
     *  successfully.
     */
    socket.on('connect', function socketConnected() {

      if (!socket.$events.disconnect) {
        socket.on('disconnect', function() {
        });
      }

      if (!socket.$events.reconnect) {
        socket.on('reconnect', function(transport, numAttempts) {
          var numSecsOffline = socket.msSinceConnectionLost / 1000;
          consolog(
            'socket reconnected successfully after being offline ' +
            'for ' + numSecsOffline + ' seconds.');
        });
      }

      if (!socket.$events.reconnecting) {
        socket.on('reconnecting', function(msSinceConnectionLost, numAttempts) {
          socket.msSinceConnectionLost = msSinceConnectionLost;
          consolog(
            'socket is trying to reconnect...' +
            '(attempt #' + numAttempts + ')');
        });
      }


      // 'error' event is triggered if connection can not be established.
      // (usually because of a failed authorization, which is in turn
      // usually due to a missing or invalid cookie)
      if (!socket.$events.error) {
        socket.on('error', function failedToConnect(err) {

          consolog(
            'Failed to connect socket (probably due to failed authorization on server)',
            'Error:', err
          );
        });
      }
    });

    if (next) next(null,socket) // use callback to ensure socket is defined
  }

  return {
    connect (config, next) {
      config || (config = {useCORSRouteToGetCookie: true})
      // If this is an attempt at a cross-origin or cross-port
      // socket connection, send an AJAX request first to ensure
      // that a valid cookie is available.  This can be disabled
      // by setting `config.useCORSRouteToGetCookie` to false.
      var isXOrigin = config.url && true; //url.match();

      if (config.useCORSRouteToGetCookie && isXOrigin) {
        // Figure out the x-origin CORS route
        // (Sails provides a default)
        var xOriginCookieRoute = '/__getcookie';
        if (typeof config.useCORSRouteToGetCookie === 'string') {
          xOriginCookieRoute = config.useCORSRouteToGetCookie;
        }

        var xOriginCookieURL = config.url + xOriginCookieRoute;

        ajax({
          url: xOriginCookieURL,
          method: 'GET'
        }, () => goAheadAndActuallyConnect(config.url, next));
      } else {
        goAheadAndActuallyConnect(config.url, next)
      }
    }
  }
}

/**
 * The JWR (JSON WebSocket Response) received from a Sails server.
 *
 * @api private
 * @param  {Object}  responseCtx
 *         => :body
 *         => :statusCode
 *         => :headers
 * @constructor
 */
function JWR (responseCtx) {
  this.body = responseCtx.body || {};
  this.headers = responseCtx.headers || {};
  this.statusCode = responseCtx.statusCode || 200;
}

JWR.prototype.toString = function() {
  return [
    '[ResponseFromSails]', '  -- ',
    'Status: ', this.statusCode, '  -- ',
    'Headers: ', this.headers, '  -- ',
    'Body: ', this.body
  ].join('')
}

JWR.prototype.toPOJO = function() {
  return {
    body: this.body,
    headers: this.headers,
    statusCode: this.statusCode
  }
}

JWR.prototype.pipe = function() {
  // TODO: look at substack's stuff
  return new Error('Not implemented yet.')
}

/**
 * A little logger for this library to use internally.
 * Basically just a wrapper around `console.log` with
 * support for feature-detection.
 *
 * @api private
 * @factory
 */
function LoggerFactory (options) {
  options = options || { prefix: true }

  // If `console.log` is not accessible, `log` is a noop.
  if (
    typeof console !== 'object' ||
    typeof console.log !== 'function' ||
    typeof console.log.bind !== 'function'
  ) {
    return function noop () {}
  }

  return function log () {
    var args = Array.prototype.slice.call(arguments);

    if (process.env.NODE_ENV==='production') return;

    // Add prefix to log messages (unless disabled)
    var PREFIX = '';
    if (options.prefix) {
      args.unshift(PREFIX);
    }

    // Call wrapped logger
    console.log
      .bind(console)
      .apply(this, args);
  }
}


/**
 * _isConnected
 *
 * @api private
 * @param  {Socket}  socket
 * @return {Boolean} whether the socket is connected and able to communicate w/ the server.
 */
function _isConnected (socket) {
  return socket.socket && socket.socket.connected;
}

/**
 * Send an AJAX request.
 * 
 * @param  {Object}   opts [optional]
 * @param  {Function} cb
 * @return {XMLHttpRequest}
 */
function ajax(opts, cb) {
  opts = opts || {};
  var xmlhttp;

  if (typeof window === 'undefined') {
    // TODO: refactor node usage to live in here
    return cb();
  }

  if (window.XMLHttpRequest) {
    // code for IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp = new XMLHttpRequest();
  } else {
    // code for IE6, IE5
    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }

  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      cb(xmlhttp.responseText);
    }
  };

  xmlhttp.open(opts.method, opts.url, true);
  xmlhttp.send();
  return xmlhttp;
}

/**
 * @api private
 * @param  {Socket} socket  [description]
 * @param  {Object} requestCtx [description]
 */

function _emitFrom(socket, requestCtx) {
  // Since callback is embedded in requestCtx,
  // retrieve it and delete the key before continuing.
  var cb = requestCtx.cb;
  delete requestCtx.cb;


  // Name of socket request listener on the server
  // ( === the request method, e.g. 'get', 'post', 'put', etc. )
  var sailsEndpoint = requestCtx.method;
  socket.emit(sailsEndpoint, requestCtx, function serverResponded(responseCtx) {

    // Adds backwards-compatibility for 0.9.x projects
    // If `responseCtx.body` does not exist, the entire
    // `responseCtx` object must actually be the `body`.
    var body;
    if (!responseCtx.body) {
      body = responseCtx;
    } else {
      body = responseCtx.body;
    }

    // Send back (emulatedHTTPBody, jsonWebSocketResponse)
    if (cb) {
      cb(body, new JWR(responseCtx));
    }
  });
}
