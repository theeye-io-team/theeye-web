import App from 'ampersand-app'

import JobActions from 'actions/job'
import FileActions from 'actions/file'

module.exports = () => {
  App.extend({
    actions: {
      job: JobActions,
      file: FileActions
    }
  })
}
