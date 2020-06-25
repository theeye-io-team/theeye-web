import App from 'ampersand-app'
import BaseModel from 'lib/app-model'
import BaseCollection from 'lib/app-collection'
import { Model as Customer } from './customer'
import config from 'config'

const urlRoot = function () {
  return `${config.supervisor_api_url}/${App.state.session.customer.name}/webhook`
}

const Model = BaseModel.extend({
  urlRoot,
  props: {
    id:'string',
    name:'string',
    secret:'string',
    enable:'boolean',
    customer_id:'string',
    _type:'string',
    creation_date:'date',
  },
  children: {
    customer: Customer
  },
  parse: function (response) {
    response.hosts = [ response.host_id ]
    return response;
  },
  derived: {
    triggerUrl: {
      deps: ['id','secret','customer'],
      fn () {
        const url = config.supervisor_api_url
        const customer_name = this.customer.name
        const secret = this.secret
        const id = this.id

        return `${url}/${customer_name}/webhook/${id}/trigger/secret/${secret}`
      }
    },
    summary: {
      deps: ['name'],
      fn () {
        return this.name
      }
    }
  }
})

const Collection = BaseCollection.extend({
  url: urlRoot,
  model: Model
})

export { Model, Collection }
