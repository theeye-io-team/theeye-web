import App from 'ampersand-app'
import bootbox from 'bootbox'
import config from 'config'
import XHR from 'lib/xhr'

module.exports = {
  get: function(id) {
    App.state.workflowPage.clear()
    XHR.send({
      url: `${config.api_url}/workflow?node=` + encodeURIComponent(id),
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
  }
}
