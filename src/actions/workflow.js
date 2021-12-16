import App from 'ampersand-app'
import bootbox from 'bootbox'
import XHR from 'lib/xhr'
import graphlib from 'graphlib'
import JobActions from 'actions/job'
import union from 'lodash/union'
import uniq from 'lodash/uniq'
import difference from 'lodash/difference'
import FileSaver from 'file-saver'
import { v4 as uuidv4 } from 'uuid'
import { Factory as TaskFactory } from 'models/task'
import loggerModule from 'lib/logger'; const logger = loggerModule('actions:workflow')

export default {
  get (id) {
    XHR.send({
      url: `${App.config.supervisor_api_url}/workflows/triggers?node=${id}`,
      method: 'get',
      done (graphData, xhr) {
        if (xhr.status === 200) {
          App.state.workflowPage.clear()
          let graph = graphlib.json.read(graphData)
          App.state.workflowPage.set('currentWorkflow', graph)
        } else {
          // ???
        }
      },
      fail (err, xhr) {
        bootbox.alert('Something went wrong. Please refresh')
      }
    })
  },
  update (id, data) {
    let model = new App.Models.Workflow.Workflow(data, { store: false })
    model.id = id
    model.version = 2 // also upgrade version
    model.save({}, {
      success () {
        App.state.alerts.success('Success', 'Workflow updated')

        // reset workflow state
        const workflow = App.state.workflows.get(id)
        workflow.set( model.serialize() )

        //App.actions.workflow.populate(workflow, true)
        workflow.tasks.fetch({
          data: {
            where: {
              workflow_id: workflow.id
            }
          }
        })

        workflow.fetchJobs(true)
        App.actions.scheduler.fetch(workflow)
      },
      error (err) {
        logger.error(err)
        bootbox.alert('Something went wrong. Please refresh')
      }
    })
  },
  fetchJobs (workflow) {
    workflow.fetchJobs()
  },
  fetchJobsInputs (workflow) {
    workflow.is_loading = true
    XHR.send({
      method: 'get',
      url: `${workflow.url()}/jobs/input?include_definitions`,
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done (jobs, xhr) {
        workflow.mergeJobs(jobs)
        workflow.is_loading = false
        //job.task.task_arguments.set(data.task.task_arguments)
        //job.task_arguments_values = data.task_arguments_values
      }
    })
  },
  create (data) {
    let workflow = new App.Models.Workflow.Workflow(data, { store: false })
    workflow.version = 2 // create only version 2 workflows.
    workflow.save({}, {
      success: () => {
        App.state.alerts.success('Success', 'Workflow created')
        workflow.tasks.reset([]) // remove all temporary tasks
        workflow.events.reset([]) // remove all temporary events
        App.state.workflows.add(workflow)
        
        // update workflow tasks state from api
        workflow.tasks.fetch({
          data: {
            where: {
              workflow_id: workflow.id
            }
          },
          //success: () => App.actions.workflow.populate(workflow)
        })
      },
      error: (err) => {
        logger.error(err)
        bootbox.alert('Something went wrong. Please refresh')
      }
    })
  },
  importCreate (recipe) {
    //let ids = []
    //let promises = []
    //for (let task of data.tasks) {
    //  const uuid = task.id
    //  ids.push(uuid)
    //  const recipe = Object.assign({}, task)
    //  delete recipe.id
    //  delete recipe.workflow_id
    //  promises.push(App.actions.task.create(recipe))
    //}
    //Promise.all(promises).then((results) => {
    //  const newIds = results.map((result) => result.id)
    //  data.start_task_id = newIds[ids.indexOf(data.start_task_id)]
    //  for (const node of data.graph.nodes) {
    //    node["v"] = newIds[ids.indexOf(node["v"])]
    //    node["value"].id = newIds[ids.indexOf(node["value"].id)]
    //  }
    //  for (const edge of data.graph.edges) {
    //    edge["v"] = newIds[ids.indexOf(edge["v"])]
    //    edge["w"] = newIds[ids.indexOf(edge["w"])]
    //  }
    //  this.create(data)
    //})
  },
  remove (id) {
    const workflow = App.state.workflows.get(id)
    workflow.destroy({
      success () {
        App.state.alerts.success('Success', 'Workflow removed')
        App.state.workflows.remove(workflow)
        unlinkTasks(workflow, Boolean(workflow.version !== 2))
      }
    })
  },
  populate (workflow, force = false) {
    if (workflow.isNew()) { return }

    if (
      workflow.alreadyPopulated === false ||
      force === true ||
      workflow.tasks.models.length === 0
    ) {
      let nodes = workflow.graph.nodes()
      let tasks = []
      nodes.forEach(id => {
        var node = workflow.graph.node(id)
        if (node && !/Event/.test(node._type)) {
          let task = App.state.tasks.get(id)
          if (!task) { return }
          tasks.push(task)
        }
      })
      workflow.tasks.add(tasks)

      tasks.forEach(task => {
        if (!task.workflow_id) {
          task.workflow_id = workflow.id
        }
      })

      workflow.alreadyPopulated = true
      //workflow.fetchJobs()
    }
  },
  triggerExecution (workflow) {
    //this.populate(workflow)
    App.actions.task.execute(workflow.start_task)
  },
  //run (workflow) {
  //  JobActions.createFromTask(workflow.start_task)
  //},
  getCredentials (id, next) {
    next || (next = () => {})
    let workflow = App.state.workflows.get(id)

    XHR.send({
      method: 'GET',
      url: `${App.config.supervisor_api_url}/workflows/${id}/credentials`,
      done (credentials) {
        workflow.credentials = credentials
      },
      fail (err, xhr) {
        let msg = 'Error retrieving workflow integrations credentials.'
        bootbox.alert(msg)
        return next(new Error(msg))
      }
    })
  },
  createRecipe (workflow) {
    const recipe = workflow.serialize()
    recipe.id = uuidv4()
    recipe.tasks = []
    recipe.events = []

    const graph = recipe.graph

    for (let node of graph.nodes) {
      const uuid = uuidv4()

      let model
      if (node && /Event$/.test(node.value._type)) {
        model = App.state.events.get(node.value.id)
        model = model.serialize()
        recipe.events.push(model)
      } else if (node && /Task$/.test(node.value._type)) {
        model = App.state.tasks.get(node.value.id)
        model = model.serialize()
        recipe.tasks.push(model)

        if (workflow.start_task_id === model.id) {
          recipe.start_task_id = uuid
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

    recipe.graph = graph
    return recipe
  },
  migrateGraph (graphData) {
    const cgraph = graphlib.json.read(graphData)
    const ngraph = new graphlib.Graph()

    const eventNodes = []
    const nodes = cgraph.nodes()
    for (let id of nodes) {
      const value = cgraph.node(id)

      if (/Event$/.test(value._type) === false) {
        ngraph.setNode(id, value)
      } else {
        eventNodes.push({ id, value })
      }
    }

    for (let node of eventNodes) {
      const eventName = node.value.name
      const edges = cgraph.nodeEdges(node.id)

      const connect = []
      for (let edge of edges) {
        if (edge.w === node.id) {
          connect[0] = edge.v
        } else {
          connect[1] = edge.w
        }
      }
      ngraph.setEdge(connect[0], connect[1], eventName)
    }

    return graphlib.json.write(ngraph)
  },
  exportRecipe (id) {
    const workflow = App.state.workflows.get(id)
    const recipe = App.actions.workflow.createRecipe(workflow)
    const jsonContent = JSON.stringify(recipe)
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const fname = recipe.name.replace(/ /g, '_')
    FileSaver.saveAs(blob, `${fname}.json`)
  }
}

const unlinkTasks = (workflow, keepCopies = false) => {
  let graph = workflow.graph
  graph.nodes().forEach(node => {
    const data = graph.node(node)
    if (!/Event/.test(data._type)) {
      const task = App.state.tasks.get(data.id)
      if (!task) { return }

      let version = workflow.version||0
      if (version < 2 || keepCopies) {
        task.workflow_id = null
        task.workflow = null
      } else {
        App.state.tasks.remove(task.id)
      }
    }
  })
}
