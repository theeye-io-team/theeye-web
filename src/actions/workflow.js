import App from 'ampersand-app'
import bootbox from 'bootbox'
import XHR from 'lib/xhr'
import graphlib from 'graphlib'
import { Workflow } from 'models/workflow'
import JobActions from 'actions/job'
import union from 'lodash/union'
import uniq from 'lodash/uniq'
import difference from 'lodash/difference'
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
    let model = new Workflow(data)
    model.id = id
    model.save({},{
      success: () => {
        App.state.alerts.success('Success', 'Workflow updated')

        // reset workflow state
        const workflow = App.state.workflows.get(id)
        workflow.set(model.serialize())

        App.actions.workflow.populate(workflow, true)
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
      error: (err) => {
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
    let workflow = new Workflow(data)
    workflow.save({},{
      success: () => {
        App.state.alerts.success('Success', 'Workflow created')
        App.state.workflows.add(workflow)
        this.populate(workflow)
        // update workflow tasks state from api
        workflow.tasks.fetch({
          data: {
            where: {
              workflow_id: workflow.id
            }
          }
        })
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
        App.state.alerts.success('Success', 'Workflow removed')
        App.state.workflows.remove(workflow)
        unlinkTasks(workflow)
      }
    })
  },
  populate (workflow, force = false) {
    if (workflow.isNew()) return

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
    this.populate(workflow)
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
