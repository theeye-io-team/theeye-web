import { Model as Host } from 'models/host'
import { Model as Resource } from 'models/resource'

import AmpersandState from 'ampersand-state'

export default AmpersandState.extend({
  props: {
    _dstat: ['object', true, () => { return {} }],
    _psaux: ['object', true, () => { return {} }],
    //dstat: ['object', true, () => { return {} }],
    //psaux: ['object', true, () => { return {} }],
    stats: 'any'
  },
  children: {
    resource: Resource,
    host: Host
  },
  initialize: function () {
    const self = this

    // mock props with proxies to handle change properly
    Object.defineProperty(this, 'psaux', {
      get: function () {
        return self._psaux
      },
      set: function (value) {
        self._psaux = value
        self.trigger('change:psaux')
        return self
      }
    })

    Object.defineProperty(this, 'dstat', {
      get: function () {
        return self._dstat
      },
      set: function (value) {
        self._dstat = value
        self.trigger('change:dstat')
        return self
      }
    })
  },
  clear () {
    this.resource.clear()
    this.host.clear()
    this.dstat = {}
    this.psaux = {}
  },
})
