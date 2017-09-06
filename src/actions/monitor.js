const Script = require('models/file/script').Model

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

module.exports = {
  populate (monitor) {
    const method = populateMethods[monitor.type]
    if (!method) return
    method.call(this,monitor)
  }
}
