import App from 'ampersand-app'
import State from 'ampersand-state'
import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'
import config from 'config'

import { Model as Customer } from 'models/customer'
import Integrations from './integrations'

const urlRoot = function () {
  return `${config.supervisor_api_url}/${App.state.session.customer.name}/host`
}

export const Model = AppModel.extend({
  urlRoot,
  props: {
    id: 'string',
    customer_name: 'string',
    customer_id: 'string',
    hostname: 'string',
    ip: 'string',
    os_name: 'string',
    os_version: 'string',
    agent_version: 'string',
    creation_date: 'date',
    last_update: 'date',
    enable: 'boolean',
    fingerprints: 'array',
    current_fingerprint: 'string',
    creation_date: 'date',
    last_update: 'date',
    order: 'number'
  },
  children: {
    customer: Customer,
    integrations: Integrations
  },
  derived: {
    fingerprint: {
      deps: ['fingerprints','current_fingerprint'],
      fn () {
        const current = this.fingerprints.find(
          f => f.fingerprint === this.current_fingerprint
        )

        if (current !== undefined) {
          return current
        }

        if (this.fingerprints.length > 0) {
          return this.fingerprints[ this.fingerprints.length - 1 ]
        }

        return undefined
      }
    },
    agent_version_redo: {
      deps: ['fingerprint'],
      fn () {
        return this.fingerprint?.agent_version || this.agent_version
      }
    }
  }
})

export const Collection = AppCollection.extend({
  model: Model,
  url: urlRoot
})
