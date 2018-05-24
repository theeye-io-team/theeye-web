import App from 'ampersand-app'
import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'
import graphlib from 'graphlib'

import config from 'config'
const urlRoot = `${config.api_v3_url}/workflow`

const formattedTags = () => {
  return {
    deps: ['name','hostname','description','tags','graph'],
    fn () {
      let graph = this.graph
      let tasksNames = []
      if (graph) {
        graph.nodes().forEach(node => {
          var data = graph.node(node)
          if (!/Event/.test(data._type)) {
            var task = App.state.tasks.get(data.id)
            if (!task) return
            tasksNames.push(task._values.name)
          }
        })
      }
      return [
        'name=' + this.name,
        'hostname=' + this.hostname,
        'description=' + this.description
      ].concat(this.tags).concat(tasksNames)
    }
  }
}

export const Workflow = AppModel.extend({
  dataTypes: {
    'graphlib.Graph': {
      set (graph) {
        if (graph instanceof graphlib.Graph) {
          return {
            val: graph,
            type: 'graphlib.Graph'
          }
        }
        try {
          // try to parse it from passed in value:
          var newGraph = graphlib.json.read(graph)

          return {
            val: newGraph,
            type: 'graphlib.Graph'
          }
        } catch (parseError) {
          // return the value with what we think its type is
          return {
            val: graph,
            type: typeof graph
          }
        }
      },
      compare (currentVal, newVal, attributeName) {
        return false
      },
      default () {
        return new graphlib.Graph()
      }
    }
  },
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
    end_task_id: ['string'],
    current_task_id: 'string',
    graph: ['graphlib.Graph', true]
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
    formatted_tags: formattedTags(),
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
        if (!this.start_task_id) return
        return App.state.tasks.get(this.start_task_id)
      }
    },
    end_task: {
      cache: false,
      deps: ['end_task_id'],
      fn () {
        if (!this.end_task_id) return
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
  }
  //parse (attrs) {
  //  attrs.graph = graphlib.json.read(attrs.graph)
  //  return attrs
  //}
})

export const Workflows = AppCollection.extend({
  indexes: ['name'],
  url: urlRoot,
  model: Workflow
})
