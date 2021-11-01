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
 * @property {FormData} options.formData multipart-form-data
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
import debugModule from 'debug'
const debug = debugModule('theeye:lib:xhr')

import Events from 'ampersand-events'

const XHR = {}
Events.createEmitter(XHR)
export default XHR

XHR.send = (options, callback) => {
  callback||(callback = function(){})

  var xhr
  var method = options.method
  var url = options.url

  xhr = new XMLHttpRequest()
  xhr.responseType = options.responseType || 'json'

  const onloadFn = (ev) => {
    var data = xhr.response
    debug('request completed with status %s', xhr.status)

    if (xhr.status >= 400) { // 400 && 500 error
      options.fail && options.fail(data, xhr)

      XHR.handleError(xhr, options)
    }

    if (xhr.status >= 200 && xhr.status <= 299) { // status 200
      options.done && options.done(data, xhr)
    }

    callback(null, xhr, xhr.response)
  }

  const onerrorFn = (ev) => {
    const err = new Error(ev.description)
    err.xhr = xhr
    debug('request error %s', xhr.status)
    options.fail ? options.fail(err, xhr) : null
    callback(err, xhr, xhr.response)
    XHR.handleError(xhr, options)
  }

  const progressFn = (ev) => { }
  const ontimeoutFn = (ev) => { }

  xhr.onload = options.onload || onloadFn
  xhr.onerror = options.onerror || onerrorFn
  xhr.onabort = options.onabort || onerrorFn
  xhr.onprogress = options.onprogress || progressFn
  xhr.ontimeout = options.ontimeout || ontimeoutFn
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

  if (options.formData) {
    data = options.formData
  }

  if (options.authorization) {
    xhr.setRequestHeader('Authorization', options.authorization)
  } else if (XHR.authorization) {
    xhr.setRequestHeader('Authorization', XHR.authorization)
  }

  xhr.withCredentials = (typeof options.withCredentials === 'boolean') ? options.withCredentials : XHR.defaults.withCredentials
  xhr.timeout = options.timeout || XHR.defaults.timeout
  xhr.send(data)
  return xhr
}

// set global authentication token
XHR.authorization = null

XHR.defaults = {
  timeout: 0,
  withCredentials: true
}

XHR.handleError = (xhr, options) => {
  const args = { xhr, options }
  if (xhr.status === 401) {
    XHR.trigger('unauthorized', args)
  } else if (xhr.status === 403) {
    XHR.trigger('forbidden', args)
  } else if (xhr.status >= 500) {
    XHR.trigger('server_error', args)
  }

  const err = new Error('XHR Error')
  err.xhr = xhr
  err.options = options
  throw err
}
