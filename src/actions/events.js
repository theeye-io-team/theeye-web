import App from 'ampersand-app'
import XHR from 'lib/xhr'
export default {
  async fetchEmitters (type) {
    const urlRoot = `${App.config.supervisor_api_url}/event/emitters?type=${type}`
    try {
      const { data } = await XHR.sendPromise({
        url: `${urlRoot}`,
        method: 'GET',
        headers: {
          Accept: 'application/json;charset=UTF-8'
        }
      })
      return data
    } catch (err) {
      App.state.alerts.danger('sorry', 'failed to fetch event emitters')
    }
  },
  async getEmitterEvents (type, emitter_id) {
    let events
    switch (type) {
      case 'task':
        events = [
          { name: 'success', label: 'Success job' },
          { name: 'failure', label: 'Failure job' },
        ]
        return events
        break;
      case 'indicator': 
        return [
          //{ name: 'created', label: 'Created' },
          { name: 'changed', label: 'Updated or Replaced' },
          { name: 'deleted', label: 'Deleted' },
          { name: 'set_state', label: 'State set' },
          { name: 'set_value', label: 'Value set' },
        ]
        break;
      case 'monitor':
        events = [
          { name: 'failure', label: 'Changed to failure' },
          { name: 'recovered', label: 'Recovered from failure' },
          { name: 'updates_stopped', label: 'Stopped reporting' },
          { name: 'updates_started', label: 'Started reporting' },
        ]
        return events
        break;
      case 'webhook':
        events = [
          { name: 'trigger', label: 'Triggered' }
        ]
        return events
        break;
      //case 'workflow':
      //  return []
      //  break;
      default:
        return []
        break;
    }
  },
  async create (props) {
    const urlRoot = `${App.config.supervisor_api_url}/event`
    try {
      const { data } = await XHR.sendPromise({
        url: `${urlRoot}`,
        method: 'POST',
        jsonData: props, //{ type, emitter_id, event_name },
        headers: {
          Accept: 'application/json;charset=UTF-8'
        }
      })
      return data
    } catch (err) {
      console.error(err)
      App.state.alerts.danger('sorry', 'failed to fetch event emitters')
    }
  }
}
