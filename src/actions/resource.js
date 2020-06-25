import App from 'ampersand-app'
import loggerModule from 'lib/logger'; const logger = loggerModule('actions:resource')
import after from 'lodash/after'
import bootbox from 'bootbox'
import assign from 'lodash/assign'
import ResourceModels from 'models/resource'
import XHR from 'lib/xhr'

const create = (data, next=function(){}) => {
  let resource = App.Models.Resource.Factory(data)
  resource.save({}, {
    success: () => {
      App.state.resources.add(resource)
      return next()
    },
    error: (err) => {
      logger.error(err)
      return next(err)
    }
  })
}

export default {
  create,
  // remote server update
  update (id, data) {
    const resource = App.state.resources.get(id)
    // monitor and resource share almost the same properties.
    // should be unified into a single model
    resource.set(data)
    resource.monitor.set(data)
    resource.save({},{
      success: () => {
        bootbox.alert('Monitor Updated')
      },
      error: () => {
        bootbox.alert('Something goes wrong updating the Monitor')
      }
    })
  },
  remove (id) {
    const resource = App.state.resources.get(id)
    resource.destroy({
      success () {
        App.state.alerts.success('Success', 'Monitor Removed.')
        if (resource.type === "host") {
          App.Router.reload()
        } else {
          App.state.resources.remove( resource )
          App.state.events.fetch()
        }
      }
    })
  },
  // apply incomming changes (socket/pull) to local cache
  applyStateUpdate (id, data) {
    var model = App.state.resources.get(data.id)
    if (!model) {
      logger.error('resource not found')
      logger.error(data)
      return
    }

    logger.log('resource updated')
    model.set(data)
    App.state.resources.sort()
  },
  workflow (id) {
    App.navigate('/admin/workflow/' + id)
  },
  createMany (data) {
    let hosts = data.hosts
    delete data.hosts

    const done = after(hosts.length, () => {
      App.state.alerts.success('Success', 'Monitor created.')
    })

    hosts.forEach(host_id => {
      let monitorData = assign({}, data, { host_id })
      create(monitorData, done)
    })
  },
  mute (id) {
    changeAlerts (id, false, function(err){
      if (!err) {
        App.state.alerts.success('Alerts are disabled.')
      } else {
        App.state.alerts.danger('An error has ocurr updating the monitor')
      }
    })
  },
  unmute (id) {
    changeAlerts (id, true, function(err){
      if (!err) {
        App.state.alerts.success('Alerts are enabled again.')
      } else {
        App.state.alerts.danger('An error has ocurr updating the monitor')
      }
    })
  }
}

const changeAlerts = (id, value, next) => {
  const resource = App.state.resources.get(id)
  const url = `${App.config.supervisor_api_url}/monitor/${id}/alerts`
  next || (next = function(){})

  if (typeof value === 'boolean') {
    XHR.send({
      url: url,
      method: 'PATCH',
      jsonData: { alerts: value },
      headers: { Accept: 'application/json;charset=UTF-8' },
      done (response, xhr) {
        resource.set('alerts', value)
        next()
      },
      error (response, xhr) {
        next( new Error() )
      },
    })
  }
}
