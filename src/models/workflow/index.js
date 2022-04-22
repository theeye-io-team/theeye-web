import App from 'ampersand-app'
import XHR from 'lib/xhr'
import Collection from 'ampersand-collection'
import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'
import { Collection as ScheduleCollection } from 'models/schedule'
import { Collection as TagCollection } from 'models/tag'
import graphlib from 'graphlib'
import * as JobConstants from 'constants/job'
import { v4 as uuidv4 } from 'uuid'

import config from 'config'
const urlRoot = function () {
  let urlRoot = `${config.supervisor_api_url}/workflows`
  return urlRoot
}

const formattedTags = () => {
  return {
    deps: ['name','hostname','tags','graph','hasSchedules'],
    /**
     * @return {Array}
     */
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
        (this.hasSchedules ? 'scheduled' : undefined),
        'name=' + this.name,
        'hostname=' + this.hostname
      ].concat(this.tags).concat(tasksNames)
    }
  }
}

const Workflow = AppModel.extend({
  ajaxConfig () {
    const config = AppModel.prototype.ajaxConfig.apply(this, arguments)

    if (this.version !== 2) {
      config.headers['Accept-Version'] = '~1'
    } else {
      config.headers['Accept-Version'] = App.config.supervisor_api_version
    }

    return config
  },
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
  urlRoot,
  props: {
    _type: 'string',
    id: 'string',
    name: 'string',
    user_id: 'string', // owner/creator
    customer_id: 'string',
    description: 'string',
    tags: ['array',false, () => { return [] }],
    acl: ['array',false, () => []],
    empty_viewers: ['boolean',false, false],
    table_view: ['boolean',false,false],
    lifecycle: 'string',
    state: 'string',
    triggers: ['array', false, () => { return [] }],
    start_task_id: ['string'],
    current_task_id: 'string',
    graph: ['graphlib.Graph', true],
    allows_dynamic_settings: ['boolean',false],
    version: 'number'
  },
  collections: {
    schedules: ScheduleCollection,
    events: function (models, options) {
      return new App.Models.Event.Collection(models, options)
    },
    tasks: function (models, options) {
      return new App.Models.Task.Collection(models, options)
    },
    jobs: function (models, options) {
      return new App.Models.Job.Collection(models, options)
    }
  },
  getInvalidTasks () {
    const models = this.tasks.filter(t => !t.canExecute)
    return new App.Models.Task.Collection(models)
  },
  session: {
    isRecipe: ['boolean', false, false],
    alreadyPopulated: ['boolean', false, false],
    jobsAlreadyFetched: ['boolean', false, false],
    inProgressJobs: 'number',
    last_execution: 'date',
    tagsCollection: 'collection',
    credentials: ['object', false, null],
    hasSchedules: ['boolean', true, false],
    hasDisabledSchedules: ['boolean', true, false]
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
        if (!this.start_task_id) {
          return
        }

        return App.state.tasks.get(this.start_task_id)
      }
    },
    current_task: {
      cache: false,
      deps: ['current_task_id'],
      fn () {
        if (!this.current_task_id) {
          return this.start_task
        }
        return App.state.tasks.get(this.current_task_id)
      }
    },
    hasDynamicArguments: {
      cache: false,
      deps: ['start_task'],
      fn () {
        if (!this.start_task) {
          //console.error('cannot determine dynamic arguments. workflow information missing')
          return null
        }

        return this.start_task.hasDynamicArguments
      }
    },
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

    this.listenToAndRun(this.tasks, 'add change sync reset remove', () => {
      this.trigger('change:tasks')
    })

    this.listenToAndRun(this.jobs, 'add change sync reset remove', function () {
      let inProgressJobs = this.jobs.filter(job => job.inProgress)
      if (inProgressJobs.length > 0) {
        this.inProgressJobs = inProgressJobs.length
      } else {
        this.inProgressJobs = 0
      }
    })

    this.listenToAndRun(this.jobs, 'add change sync reset remove', function () {
      if (this.jobs.length===0) { return }
      let dates = this.jobs.map(e => e.creation_date).filter(e => e)
      const last = Math.max.apply(null, dates)
      if (typeof last === 'date') {
        this.last_execution = last
      }
    })

    this.listenToAndRun(this.schedules, 'change reset sync remove add', () => {
      this.hasSchedules = (this.schedules.length > 0)
      if (this.hasSchedules) {
        this.hasDisabledSchedules = (
          this.schedules.find(sch => sch.disabled === true) !== undefined
        )
      }
    })
  },
  serialize () {
    let attrs = AppModel.prototype.serialize.apply(this,arguments)
    attrs.graph = this.serializeGraph()
    delete attrs.jobs
    delete attrs.schedules
    return attrs
  },
  serializeGraph () {
    const graph = graphlib.json.write(this.graph)
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
    return graph
  },
  serializeClone () {
    const serial = this.serialize()

    //serial.id = uuidv4()
    delete serial.id
    serial.tasks = []
    serial.events = []

    const graph = serial.graph

    for (let node of graph.nodes) {
      const uuid = uuidv4()

      let model
      if (node && /Event$/.test(node.value._type)) {
        model = App.state.events.get(node.value.id)
        model = model.serialize()
        serial.events.push(model)
      } else if (node && /Task$/.test(node.value._type)) {
        model = App.state.tasks.get(node.value.id)
        model = model.serialize()
        serial.tasks.push(model)

        if (this.start_task_id === model.id) {
          serial.start_task_id = uuid
        }
      }

      node.v = uuid
      node.value.id = uuid

      for (let edge of graph.edges) {
        if (edge.v === model.id) { edge.v = uuid }
        if (edge.w === model.id) { edge.w = uuid }
      }

      // update only after mapping edges with nodes
      model.id = uuid
    }

    serial.graph = graph
    return serial
  },
  /**
   *
   * @summary fetch workflow instances organized by task. will populate workflow jobs
   *
   */
  fetchJobs (force = false) {
    return new Promise((resolve, reject) => {

      if (this.jobsAlreadyFetched === true && force === false) {
        return resolve()
      }

      XHR.send({
        method: 'GET',
        url: `${App.config.supervisor_api_url}/workflows/${this.id}/job`,
        done: (jobs) => {
          const groups = groupJobs(this, jobs)
          this.jobs.reset(groups)
          resolve()
          this.jobsAlreadyFetched = true
        },
        fail (err, xhr) {
          reject( new Error(arg1) )
        }
      })
    })
  },
  mergeJobs (jobs) {
    const groups = groupJobs(this, jobs)
    this.jobs.add(groups, {merge:true})
  }
})

const groupJobs = (workflow, jobs) => {
  let wJobs = []
  if (jobs.length>0) {
    let tJobs = []

    // order resulting jobs into task and workflow jobs
    jobs.forEach(job => {
      if (job._type === 'WorkflowJob') {
        job.startTaskId = workflow.start_task_id
        wJobs.push(job)
      } else {
        tJobs.push(job)
      }
    })

    // assign each task job to its own workflow job instance
    if (tJobs.length > 0) {
      tJobs.forEach(tJob => {
        // seach the matching workflow job
        let wJob = wJobs.find(wJob => {
          return wJob.id === tJob.workflow_job_id
        })

        if (!wJob) {
          // orphan? how?
          wJob = {
            id: tJob.workflow_job_id,
            _type: JobConstants.WORKFLOW_TYPE,
            jobs: []
          }

          wJobs.push(wJob)
        }

        if (!wJob.jobs) { wJob.jobs = [] }
        wJob.jobs.push(tJob)
      })
    }
  }
  return wJobs
}

const Workflows = AppCollection.extend({
  indexes: ['name'],
  url: urlRoot,
  model: Workflow
})

export { Workflows, Workflow }
