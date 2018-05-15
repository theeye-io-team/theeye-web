import App from 'ampersand-app'
import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'
import graphlib from 'graphlib'

import config from 'config'
const urlRoot = `${config.api_v3_url}/workflow`

export const Workflow = AppModel.extend({
  urlRoot: urlRoot,
  props: {
    _type: 'string',
    id: 'string',
    name: 'string',
		user_id: 'string', // owner/creator
    customer_id: 'string',
    description: 'string',
    tags: 'array',
    acl: 'array',
    triggers: ['array', false, () => { return [] }],
    first_task_id: ['string',true],
    last_task_id: ['string',true],
    graph: ['object', false, () => {
      return new graphlib.Graph()
    }]
  },
  collections: {
    tasks: function (attrs, options) {
      return new App.Collections.Tasks(attrs, options)
    }
  },
  derived: {
    canExecute: {
      deps: [],
      fn () {
        return true
      }
    }
  },
  //children: {
  //  last_task: Task,
  //  first_task: Task
  //},
  serialize () {
    let attrs = AppModel.prototype.serialize.apply(this,arguments)
    let graph = graphlib.json.write(this.graph)
    graph.nodes = graph.nodes.map(node => {
      return {
        v: node.v,
        value: { 
          name: node.value.name,
          id: node.value.id,
          _type: node.value._type,
          type: node.value.type
        }
      }
    })

    attrs.graph = graph
    return attrs
  },
  parse (attrs) {
    attrs.graph = graphlib.json.read(attrs.graph)
    return attrs
  }
})

export const Workflows = AppCollection.extend({
  indexes: ['name'],
  url: urlRoot,
  model: Workflow
})
