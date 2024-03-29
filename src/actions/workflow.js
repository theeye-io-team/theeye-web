import App from 'ampersand-app'
import bootbox from 'bootbox'
import XHR from 'lib/xhr'
import graphlib from 'graphlib'
import JobActions from 'actions/job'
import union from 'lodash/union'
import uniq from 'lodash/uniq'
import difference from 'lodash/difference'
import FileSaver from 'file-saver'
import * as TaskConstants from 'constants/task'
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
        model.tasks.reset([])
        model.events.reset([])
        workflow.set( model.serialize() )

        //App.actions.workflow.populate(workflow, true)
        workflow.tasks.fetch({
          data: {
            where: {
              workflow_id: workflow.id
            }
          },
          success: () => {
            // resync files
            for (let task of workflow.tasks.models) {
              if (task.type === TaskConstants.TYPE_SCRIPT) {
                App.actions.file.retrieve(task.script_id)
              }
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
    return workflow.fetchJobs()
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
      }
    })
  },
  create (data) {
    XHR.send({
      method: 'post',
      url: App.Models.Workflow.Workflow.prototype.urlRoot(),
      jsonData: data,
      responseType: 'json',
      headers: {
        Accept: 'application/json;charset=UTF-8',
        'Accept-Version': App.config.supervisor_api_version
      },
      done: (body, xhr) => {
        App.state.alerts.success('Success', 'Workflow created')

        const workflow = new App.Models.Workflow.Workflow(body, { store: false })
        App.state.workflows.add(workflow)

        // fetch workflow tasks state to the api
        workflow.tasks.fetch({
          data: {
            where: {
              workflow_id: workflow.id
            }
          },
          success: () => {
            for (let task of workflow.tasks.models) {
              if (task.type === TaskConstants.TYPE_SCRIPT) {
                App.actions.file.retrieve(task.script_id)
              }
            }
          }
        })
      },
      fail: (err, xhr) => {
        logger.error(err)
        bootbox.alert('Something went wrong. Please refresh')
      }
    })
  },
  remove (id, keepTasks) {
    const workflow = App.state.workflows.get(id)
    workflow.destroy({
      data: { keepTasks },
      success () {
        App.state.alerts.success('Success', 'Workflow removed')
        App.state.workflows.remove(workflow)
        unlinkTasks(workflow, keepTasks)
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
  //triggerExecution (workflow) {
  //  App.actions.task.execute(workflow.start_task)
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
        App.state.alerts.danger('Failure', msg)
        return next(new Error(msg))
      }
    })
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
  exportSerialization (id, mode) {
    //const workflow = App.state.workflows.get(id)
    this.getSerialization(id, mode).then(recipe => {
      const jsonContent = JSON.stringify(recipe)
      const blob = new Blob([jsonContent], { type: 'application/json' })
      const fname = recipe.name.replace(/ /g, '_')
      FileSaver.saveAs(blob, `${fname}_workflow_${mode}.json`)
    })
  },
  getSerialization (id, mode) {
    return new Promise( (resolve, reject) => {
      XHR.send({
        method: 'GET',
        url: `${App.config.supervisor_api_url}/workflows/${id}/serialize?mode=${mode}`,
        headers: {
          'Accept': 'application/json;charset=UTF-8',
          'Accept-Version': App.config.supervisor_api_version
        },
        done (serialization) {
          resolve(serialization)
        },
        fail (xhrErr, xhr) {
          const err = new Error('Error retrieving workflow serialization.')
          err.xhr = xhr
          err.error = xhrErr
          App.state.alerts.danger('Failure', err.message)
          reject(err)
        }
      })
    })
  },
  parseSerialization (serial) {
    const props = Object.assign({ tasks: null }, serial)
    const tasks = []
    for (let taskSerial of serial.tasks) {
      tasks.push( App.actions.task.parseSerialization(taskSerial) )
    }
    props.tasks = tasks

    delete props.id // his is a new workflow should not have it
    const workflow = new App.Models.Workflow.Workflow(props, { store: false })
    return workflow
  },
  changeHost (workflow, hostId) {
    App.state.loader.visible = true
    const promises = []
    for (let task of workflow.tasks.models) {
      promises.push(
        new Promise((resolve, reject) => {
          task.host_id = hostId
          task.save({}, { success: resolve, error: reject })
        })
      )
    }

    Promise.all(promises).then(res => {
      App.state.loader.visible = false
      App.state.alerts.success('Host changed')
    })
  }
}

const unlinkTasks = (workflow, keepTasks = false) => {
  let graph = workflow.graph
  graph.nodes().forEach(node => {
    const data = graph.node(node)
    if (!/Event/.test(data._type)) {
      const task = App.state.tasks.get(data.id)
      if (!task) { return }

      let version = workflow.version||0
      if (keepTasks === true) {
        task.workflow_id = null
        task.workflow = null
      } else {
        App.state.tasks.remove(task.id)
      }
    }
  })
}
