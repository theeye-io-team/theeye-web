import WorkflowPage from 'view/page/workflow'
import Route from 'lib/router-route'

import WorkflowActions from 'actions/workflow'

class Workflow extends Route {
  indexRoute (options) {
    WorkflowActions.get(options.id)
    return new WorkflowPage()
  }
}

export default Workflow
