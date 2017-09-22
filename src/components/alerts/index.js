'use strict'

const State = require('ampersand-state')
const AlertView = require('./view')
const extend = require('lodash/extend')

require('./style.css')

const ServerErrorType = {
  set (newVal) {
    if (newVal instanceof Error) {
      return {
        val: newVal,
        type: 'serverError'
      }
    }
    try {
      // try to parse it from passed in value:
      var errorData = new Error(newVal)

      return {
        val: errorData,
        type: 'serverError'
      }
    } catch (parseError) {
      // return the value with what we think its type is
      return {
        val: newVal,
        type: typeof newVal
      }
    }
  },
  compare (currentVal, newVal, attributeName) {
    if (!currentVal) return false
    if (currentVal !== newVal) return false
    if (!currentVal.footprint || !newVal.footprint) {
      return false
    }
    return currentVal.footprint === newVal.footprint
  }
}

const AlertsType = {
  set (newVal) {
    return {
      val: newVal,
      type: 'alerts'
    }
  },
  compare (currentVal, newVal, attributeName) {
    if (!currentVal) return false
    if (currentVal.footprint && newVal.footprint) {
      return currentVal.footprint === newVal.footprint
    }
    return false
  }
}

module.exports = State.extend({
  dataTypes: {
    serverError: ServerErrorType,
    alerts: AlertsType
  },
  props: {
    serverError: 'serverError',
    alerts: 'alerts',
    xhr: 'object'
  },
  _renderAlertsContainer () {
    var elemDiv = document.createElement('div')
    elemDiv.style.cssText = ''
    elemDiv.className = 'alert-container'
    document.body.appendChild(elemDiv)
    this.container = elemDiv
  },
  _removeAlertsContainer () {
    this.container.remove()
  },
  _renderAlert (view) {
    view.render()
    this.container.appendChild(view.el)
  },
  // constructor
  initialize () {
    this.listenTo(this, 'change:serverError', this.showServerError)
    this.listenTo(this, 'change:alerts', this.showAlerts)
    this._renderAlertsContainer()
  },
  showAlerts () {
    var view = new AlertView(this.alerts)
    this._renderAlert(view)
  },
  showServerError () {
    var error = this.serverError
    var message = (error.details && error.details.join('. ')) || error.message
    var view = new AlertView({
      message: message || undefined,
      type: 'alert-warning',
      title: 'Something went wrong...'
    })
    this._renderAlert(view)
  },
  handleServerError (xhr) {
    if (xhr.response) {
      var response = xhr.response
      var error = new Error(response.error.message)
      extend(error, response.error)
      error.xhr = xhr
      error.footprint = Date.now()

      if (response.error && response.error.details) {
        var messages = response.error.details.messages
        var details = []
        for (var prop in messages) {
          var msg = messages[prop].join(', ')
          details.push(msg)
        }
        error.details = details
      }

      this.set('serverError', error)
    }
  },
  success (title, message, options) {
    this._renderAlert(
      new AlertView({
        title: title || undefined,
        message: message || undefined,
        type: 'alert-success'
      })
    )
  },
  danger (title, message, options) {
    this._renderAlert(
      new AlertView({
        title: title || undefined,
        message: message || undefined,
        type: 'alert-danger'
      })
    )
  },
  warning (title, message, options) {
    this._renderAlert(
      new AlertView({
        title: title || undefined,
        message: message || undefined,
        type: 'alert-warning'
      })
    )
  },
  info (title, message, options) {
    this._renderAlert(
      new AlertView({
        title: title || undefined,
        message: message || undefined,
        type: 'alert-info'
      })
    )
  }
})
