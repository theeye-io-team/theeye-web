import App from 'ampersand-app'
import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'
const TagCollection = require('models/tag').Collection
import graphlib from 'graphlib'

import config from 'config'
const urlRoot = `${config.api_v3_url}/workflows`

const formattedTags = () => {
  return {
    deps: ['name','hostname','tags','graph'],
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
        'hostname=' + this.hostname
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
    tags: ['array',false, () => { return [] }],
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
    tasks: function (models, options) {
      return new App.Models.Task.Collection(models, options)
    },
    jobs: function (models, options) {
      return new App.Models.Job.Collection(models, options)
    }
  },
  session: {
    alreadyPopulated: ['boolean', false, false],
    inProgressJobs: 'number',
    last_execution: 'date',
    tagsCollection: 'collection',
    credentials: ['object', false, null]
  },
  derived: {
    type: {
      fn: () => 'workflow'
    },
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
  initialize () {
    AppModel.prototype.initialize.apply(this,arguments)

    this.tagsCollection = new TagCollection([])

    this.listenToAndRun(this, 'change:tags', () => {
      if (Array.isArray(this.tags)) {
        let tags = this.tags.map((tag, index) => {
          return {_id: (index + 1).toString(), name: tag}
        })
        tags = tags.slice(0, 3)
        this.tagsCollection.set(tags)
      }
    })

    this.listenToAndRun(
      this.jobs,
      'add change sync reset remove',
      function () {
        let inProgressJobs = this.jobs.filter(job => job.inProgress)
        if (inProgressJobs.length > 0) {
          this.inProgressJobs = inProgressJobs.length
        } else {
          this.inProgressJobs = 0
        }
      }
    )

    this.listenToAndRun(
      this.jobs,
      'add change sync reset remove',
      function () {
        if (this.jobs.length===0) { return }
        let dates = this.jobs.map(e => e.creation_date)
        this.last_execution = Math.max.apply(null, dates)
      }
    )
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
  },
  /**
   *
   * @summary fetch workflow instances organized by task. will populate workflow jobs
   *
   */
  fetchJobs (callback) {
    callback || (callback = () => {})
    this.jobs.fetch({
      set: false,
      data: {
        where: {
          workflow_id: this.id
        }
      },
      success: (collection, jobs, options) => {
        this.jobs.reset(groupJobs(jobs))
        //this.reset(models, options)
        //this.trigger('sync', this, models, options)
        // group jobs by workflow_job
        callback()
      },
      error: (arg1) => {
        callback( new Error(arg1) )
      }
    })
  }
  //parse (attrs) {
  //  attrs.graph = graphlib.json.read(attrs.graph)
  //  return attrs
  //}
})

const groupJobs = (jobs) => {
  let wJobs = []
  if (jobs.length>0) {
    let tJobs = []

    // order resulting jobs into task and workflow jobs
    jobs.forEach(job => {
      if (job._type === 'WorkflowJob') {
        wJobs.push(job)
      } else {
        tJobs.push(job)
      }
    })

    if (wJobs.length > 0) {
      // assign each task job to its own workflow job instance
      if (tJobs.length > 0) {
        tJobs.forEach(tJob => {
          // seach the matching workflow job
          let wJob = wJobs.find(wJob => {
            return wJob.id === tJob.workflow_job_id
          })

          if (wJob) {
            if (!wJob.jobs) { wJob.jobs = [] }
            wJob.jobs.push(tJob)
          }
        })
      }
    }
  }
  return wJobs
}

export const Workflows = AppCollection.extend({
  indexes: ['name'],
  url: urlRoot,
  model: Workflow
})
