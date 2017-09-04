/**
 *
 * XMLHttpRequest browser wrapper
 *
 * @namespace Lib/XHR
 * @summary Simplified XHR wrapper.
 *
 * @author Facugon
 * @param {Object} options
 * @property {String} options.method
 * @property {String} options.url
 * @property {Object} options.headers headers object in 'key:value' format
 * @property {String} options.responseType default to 'json'
 * @property {Boolean} options.withCredentials default to 'false'
 * @property {Mixed} options.jsonData the json request body. also set the header "Content-Type: application/json;charset=UTF-8"
 * @property {Function} options.done success callback
 * @property {Function} options.fail failure callback
 * @property {Function} options.onload assign onload event to the xhr
 * @property {Function} options.error assign onerror event to the xhr
 * @property {Function} options.abort assign onabort event to the xhr
 * @property {Function} options.progress assign onprogress event to the xhr
 *
 * @return {XMLHttpRequest}
 *
 */
const debug = require('debug')('lib:xhr')

function XHR (options, callback) {
  callback||(callback = function(){})

  var xhr
  var method = options.method
  var url = options.url

  xhr = new XMLHttpRequest()
  xhr.responseType = options.responseType || 'json'
  // include cookies and accept cross site cookies
  xhr.withCredentials = options.withCredentials || false

  const doneFn = (ev) => {
    var data = xhr.response
    debug('request completed with status %s', xhr.status)
    options.done ? options.done(data, xhr) : null
    callback(null, xhr, xhr.response)
  }

  const failFn = (ev) => {
    var error = new Error(ev.description)
    error.xhr = xhr
    debug('request error %s', xhr.status)
    options.fail ? options.fail(error, xhr) : null
    callback(error, xhr, xhr.response)
  }

  const progressFn = (ev) => { }

  xhr.onload = options.onload || doneFn
  xhr.onerror = options.onerror || failFn
  xhr.onabort = options.onabort || failFn
  xhr.onprogress = options.onprogress || progressFn

  xhr.open(method, url)

  /**
   *
   * seting up headers
   *
   */
  const headers = options.headers
  if (headers) {
    for (let name in headers) {
      let header = headers[name]
      if (
        typeof header === 'string' &&
        typeof name === 'string'
      ) {
        xhr.setRequestHeader(name, header)
      }
    }
  }

  let data = ''
  if (options.jsonData) {
    data = JSON.stringify(options.jsonData)
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
  }

  if (XHR.access_token) {
    xhr.setRequestHeader('Authorization', XHR.access_token)
    xhr.withCredentials = true
  }

  xhr.send(data)
  return xhr
}

// set global authentication token
XHR.access_token = null

module.exports = XHR
