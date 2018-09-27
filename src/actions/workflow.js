import App from 'ampersand-app'
import bootbox from 'bootbox'
import XHR from 'lib/xhr'
import graphlib from 'graphlib'
import { Workflow } from 'models/workflow'
import JobActions from 'actions/job'
import union from 'lodash/union'
import uniq from 'lodash/uniq'
import difference from 'lodash/difference'
const logger = require('lib/logger')('actions:workflow')

module.exports = {
  get (id) {
    XHR.send({
      url: `${App.config.api_v3_url}/workflow/triggers?node=${id}`,
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
    let tmp = new Workflow(data)
    tmp.id = id
    tmp.save({},{
      success: () => {
        const workflow = App.state.workflows.get(id)
        workflow.set(tmp.serialize())
        workflow.alreadyPopulated = false // reset to repopulate
        this.populate(workflow)
        this.updateAcl(id)
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
        this.updateAcl(workflow.id)
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
    if (workflow.alreadyPopulated) { return }
    if (workflow.tasks.models.length!==0) { return }

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

    workflow.alreadyPopulated = true
    workflow.fetchJobs()
  },
  triggerExecution (workflow) {
    this.populate(workflow)
    App.actions.task.execute(workflow.start_task)
  },
  run (workflow) {
    JobActions.createFromTask(workflow.start_task)
  },
  updateAcl (id) {
    let workflow = App.state.workflows.get(id)
    let acl, allAcls = []
    allAcls.push(workflow.acl)
    workflow.tasks.forEach(task => allAcls.push(task.acl))
    acl = union.apply(union, allAcls)

    if (difference(acl, workflow.acl).length>0) {
      workflow.acl = acl
      workflow.save({}, {
        success: () => {
        },
        error: (err) => {
          logger.error(err)
          bootbox.alert('Something went wrong. Please refresh')
        }
      })
    }
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
