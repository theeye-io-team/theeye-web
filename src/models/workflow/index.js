import App from 'ampersand-app'
import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'
import graphlib from 'graphlib'
import { Factory as TaskFactory } from 'models/task'

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
    lifecycle: 'string',
    state: 'string',
    triggers: ['array', false, () => { return [] }],
    start_task_id: ['string',true],
    end_task_id: ['string',true],
    current_task_id: 'string',
    graph: ['object', false, () => {
      return new graphlib.Graph()
    }]
  },
  collections: {
    tasks: function (attrs, options) {
      return new App.Collections.Tasks(attrs, options)
    }
  },
  session: {
    populated: 'boolean'
  },
  derived: {
    canExecute: {
      deps: [],
      fn () {
        return true
      }
    },
    start_task: {
      cache: false,
      deps: ['start_task_id'],
      fn () {
        return App.state.tasks.get(this.start_task_id)
      }
    },
    end_task: {
      cache: false,
      deps: ['end_task_id'],
      fn () {
        return App.state.tasks.get(this.end_task_id)
      }
    },
    current_task: {
      cache: false,
      deps: ['current_task_id'],
      fn () {
        if (!this.current_task_id) return this.start_task
        return App.state.tasks.get(this.current_task_id)
      }
    }
  },
  //children: {
  //  start_task: TaskFactory,
  //  end_task: TaskFactory,
  //  current_task: TaskFactory
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
