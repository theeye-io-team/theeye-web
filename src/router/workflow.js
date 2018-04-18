import WorkflowPage from 'view/page/workflow'
import App from 'ampersand-app'
import XHR from 'lib/xhr'
import Route from 'lib/router-route'
import bootbox from 'bootbox'
import config from 'config'

class Workflow extends Route {
  indexRoute (options) {
    var query = {node: options.id}
    XHR.send({
      url: `${config.api_url}/workflow?node=` + encodeURIComponent(options.id),
      // url: `${config.api_v3_url}/workflow/${options.id}/graph`,
      method: 'get',
      timeout: 5000,
      done (workflow,xhr) {
        if(xhr.status == 200 && workflow.nodes)
          App.state.workflowPage.set('currentWorkflow', workflow)
      },
      fail (err,xhr) {
        bootbox.alert('Something went wrong. Please refresh')
      }
    })

    return new WorkflowPage({currentWorkflow: {}})
  }
}

module.exports = Workflow
