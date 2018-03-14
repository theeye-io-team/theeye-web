const Script = require('models/file/script').Model
import App from 'ampersand-app'

const populateScriptMonitor = (model) => {
  if (!model.monitor.config.script) {
    const script = new Script()
    model.monitor.config.script = script
    script.id = model.monitor.config.script_id
    script.fetch({
      success () {
        model.monitor.trigger('change:config')
      }
    })
  }
}

const populateHostMonitor = (model) => {
  model.submonitors.models.forEach(function(submonitor){
    if(submonitor.type == 'dstat') {
      submonitor.fetch()
    }
  })
}

const populateMethods = {
  script: populateScriptMonitor,
  scraper: null,
  file: null,
  process: null,
  host: populateHostMonitor
}

const callPopulateByType = (model) => {
  const method = populateMethods[model.monitor.type]
  if (!method) return
  method.call(this,model)
}

module.exports = {
  populate (model) {
    if (!model.monitor.host.id) {
      let host = App.state.hosts.get(model.monitor.host_id)
      if (!host) {
        model.monitor.host.id = model.monitor.host_id
        model.monitor.host.fetch()
      } else {
        model.monitor.host.set( host.serialize() )
      }
    }

    callPopulateByType(model)
  }
}
