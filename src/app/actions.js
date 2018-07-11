import App from 'ampersand-app'

import JobActions from 'actions/job'

module.exports = () => {
  App.extend({
    actions: {
      job: JobActions
    }
  })
}
