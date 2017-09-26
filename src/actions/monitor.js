const Script = require('models/file/script').Model
import App from 'ampersand-app'

const populateScriptMonitor = (monitor) => {
  if (!monitor.config.script) {
    const script = new Script()
    monitor.config.script = script
    script.id = monitor.config.script_id
    script.fetch({
      success () {
        monitor.trigger('change:config')
      }
    })
  }
}

const populateMethods = {
  script: populateScriptMonitor,
  scraper: null,
  file: null,
  process: null
}

const callPopulateByType = (monitor) => {
  const method = populateMethods[monitor.type]
  if (!method) return
  method.call(this,monitor)
}

module.exports = {
  populate (monitor) {
    if (!monitor.host.id) {
      let host = App.state.hosts.get(monitor.host_id)
      if (!host) {
        monitor.host.id = monitor.host_id
        monitor.host.fetch()
      } else {
        monitor.host.set( host.serialize() )
      }
    }

    callPopulateByType(monitor)
  }
}
