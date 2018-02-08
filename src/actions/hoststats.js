import App from 'ampersand-app'
import LifecycleConstants from 'constants/lifecycle'

export default {
  update (type, stats) {
    if ( /hoststats/.test(window.location.pathname) ) { // currently navigating host stats
      if (App.state.hoststatsPage.host.id == stats.host_id) {
        App.state.hoststatsPage[type] = stats
      }
    }
  },
  updateIntegrationsJobs (jobData) {
    if (jobData._type == 'NgrokIntegrationJob') {
      if ( /hoststats/.test(window.location.pathname) ) { // currently navigating host stats
        let host = App.state.hoststatsPage.host
        if (jobData.host_id == host.id) {
          if (jobData.lifecycle==LifecycleConstants.FINISHED) {
            if (!jobData.result) {
              jobData.result = {url:''} // reset url
            }
          }

          host.integrations.ngrok.last_job.set( jobData )
        }
      }
    }
  }
}
