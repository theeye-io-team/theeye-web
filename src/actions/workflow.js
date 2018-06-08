import App from 'ampersand-app'
import bootbox from 'bootbox'
import config from 'config'
import XHR from 'lib/xhr'
import graphlib from 'graphlib'
import { Workflow } from 'models/workflow'
import JobActions from 'actions/job'
const logger = require('lib/logger')('actions:workflow')

module.exports = {
  get (id) {
    XHR.send({
      url: `${config.api_v3_url}/workflow/triggers?node=${id}`,
      method: 'get',
      timeout: 5000,
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

    let nodes = workflow.graph.nodes()
    var tasks = []
    nodes.forEach(id => {
      var node = workflow.graph.node(id)
      if (node && !/Event/.test(node._type)) {
        let task = App.state.tasks.get(id)
        if (!task) return
        tasks.push(task)
      }
    })
    workflow.tasks.add(tasks)

    tasks.forEach(task => {
      if (!task.workflow_id) {
        task.workflow_id = workflow.id
      }
    })

    workflow.populated = true
  },
  triggerExecution (workflow) {
    this.populate(workflow)
    workflow.start_task.trigger('execution')
  },
  run (workflow) {
    JobActions.createFromTask(workflow.start_task)
  }
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
