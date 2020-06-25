import App from 'ampersand-app'
import * as MonitorConstants from 'constants/monitor'
import bootbox from 'bootbox'

export default {
  populate (model) {
    // nested monitor doesn't has host
    if (model.type !== MonitorConstants.TYPE_NESTED) {
      if (!model.host.id) {
        let host = App.state.hosts.get(model.host_id)
        if (!host) {
          model.host.id = model.monitor.host_id
          model.host.fetch()
        } else {
          model.host.set( host.serialize() )
        }
      }
    }

    callPopulateByType(model)
  },
  create (data) {
    let hosts = data.hosts
    delete data.hosts

    const done = () => { }

    for (let i=0; i<hosts.length; i++) {
      let host_id = hosts[i]
      let props = Object.assign({}, data, { host_id })
      createMonitor(props, done)
    }
  },
  //update (id, data) {
  //}
}

const createMonitor = (data, next) => {
  let monitor = new App.Models.Monitor.Factory(data)
  monitor.save({}, {
    success: () => {
      //App.state.alerts.success('Success', 'Monitor Created')
      //App.state.events.fetch()
      next()
    },
    error: () => {
      next()
    }
  })
}

const callPopulateByType = (model) => {
  const method = populateMethods[model.monitor.type]
  if (!method) { return }
  method.call(this,model)
}

const populateMethods = {
  script: (model) => {
    // on-demand initialization
    if (!model.monitor.script.id) {
    }

    let file = App.state.files.get(model.monitor.script_id)
    model.monitor.script.set( file.serialize() )
  },
  host: (model) => {
    model.submonitors.models.forEach(function(submonitor){
      if (submonitor.type == 'dstat') {
        submonitor.fetch()
      }
    })
  },
  nested: (model) => {
    let monitors = model.monitor.monitors // resource models in fact
    monitors.forEach(mon => {
      if (mon.id) {
        if (!mon.state || !mon.name) {
          let monitor = App.state.resources.get(mon.id)
          if (!monitor) {
            mon.fetch() // fetch from server
          } else {
            mon.set( monitor.serialize() )
            mon.listenTo(monitor, 'change', () => {
              mon.set(monitor.changedAttributes())
            })
          }
        }
      } else {
        console.error(`nested monitor definition is incomplete ${JSON.stringify(mon._values)}`)
      }
    })
  },
  scraper: null,
  file: null,
  process: null
}
