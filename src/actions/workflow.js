import App from 'ampersand-app'
import bootbox from 'bootbox'
import config from 'config'
import XHR from 'lib/xhr'
import graphlib from 'graphlib'
import { Workflow } from 'models/workflow'
const logger = require('lib/logger')('actions:workflow')

module.exports = {
  get (id) {
    XHR.send({
      url: `${config.api_v3_url}/workflow/id/graph`,
      method: 'get',
      timeout: 5000,
      done (workflow, xhr) {
        if (xhr.status === 200) {
          App.state.workflowPage.clear()
          let graph = graphlib.json.read(workflow)
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
    let tmp = new Workflow(data)
    tmp.id = id
    tmp.save({},{
      success: () => {
        const workflow = App.state.workflows.get(id)
        workflow.set(tmp.serialize())
        workflow.populated = false // reset to repopulate
        this.populate(workflow)
      },
      error: (err) => {
        logger.error(err)
        bootbox.alert('Something went wrong. Please refresh')
      }
    })
  },
  create (data) {
    let workflow = new Workflow(data)
    workflow.save({},{
      success: () => {
        App.state.workflows.add(workflow)
        this.populate(workflow)
      },
      error: (err) => {
        logger.error(err)
        bootbox.alert('Something went wrong. Please refresh')
      }
    })
  },
  remove (id) {
    const workflow = App.state.workflows.get(id)
    workflow.destroy({
      success () {
        bootbox.alert('Workflow deleted')
        App.state.workflows.remove(workflow)
        unlinkTasks(workflow)
      }
    })
  },
  populate (workflow) {
    if (workflow.populated) return
    if (workflow.tasks.models.length!==0) return
    var nodes = workflow.graph.nodes()
    var first = workflow.start_task_id
    walkGraph([], workflow.graph, null, first, (tasks) => {
      workflow.tasks.add(tasks)
      tasks.forEach(task => {
        if (!task.workflow_id) {
          task.workflow_id = workflow.id
        }
      })
    })
    workflow.populated = true
  },
  triggerExecution (workflow) {
    this.populate(workflow)
    workflow.start_task.trigger('execution')
  }
}

const walkGraph = (acum, graph, previous, current, end) => {
  if (!current) {
    logger.log('workflow walk completed. no more to walk.')
    return end(acum)
  }
  var data = graph.node(current)
  var successors = graph.successors(current)

  if (!/Event/.test(data._type)) {
    var task = App.state.tasks.get(data.id)
    if (task) {
      acum.push(task)
    }
  }

  walkGraph(acum, graph, current, successors[0], end)
}

const unlinkTasks = (workflow) => {
  let graph = workflow.graph
  graph.nodes().forEach(node => {
    var data = graph.node(node)
    if (!/Event/.test(data._type)) {
      var task = App.state.tasks.get(data.id)
      if (!task) return
      task.workflow_id = null
      task.workflow = null
    }
  })
}
