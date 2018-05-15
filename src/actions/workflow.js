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
  create (data) {
    let workflow = new Workflow(data)
    workflow.save({},{
      success: () => {
        App.state.workflows.add(workflow)
      },
      error: (err) => {
        logger.error(err)
        bootbox.alert('Something went wrong. Please refresh')
      }
    })
  },
  populate (workflow) {
    if (workflow.tasks.models.length!==0) return
    var nodes = workflow.graph.nodes()
    var first = workflow.first_task_id
    walkGraph([], workflow.graph, null, first, (tasks) => {
      workflow.tasks.add(tasks)
    })
  }
}

const walkGraph = (acum, graph, previous, current, end) => {
  if (!current) {
    logger.log('no more to walk')
    return end(acum)
  }
  var data = graph.node(current)
  var successors = graph.successors(current)

  if (data._type == 'Task') {
    var task = App.state.tasks.get(data.id)
    if (task) {
      acum.push(task)
    }
  }

  walkGraph(acum, graph, current, successors[0], end)
}
