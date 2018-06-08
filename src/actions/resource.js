import App from 'ampersand-app'
const logger = require('lib/logger')('actions:resource')
import after from 'lodash/after'
import bootbox from 'bootbox'
import assign from 'lodash/assign'
import ResourceModels from 'models/resource'
import XHR from 'lib/xhr'
const config = require('config')

const create = (data, next = function(){}) => {
  let resource = ResourceModels.Factory(data)
  // only send form "data" to the api
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

module.exports = {
  create: create,
  // remote server update
  update (id, data) {
    let resource = App.state.resources.get(id)
    // monitor and resource share almost the same properties.
    // should be unified into a single model
    resource.set(data)
    resource.monitor.set(data)
    //resource.save(data,{
    //  patch: true,
    resource.save({},{
      success: () => {
        bootbox.alert('Monitor Updated')
      },
      error: () => {
        bootbox.alert('Something goes wrong updating the Monitor')
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
  edit (id) {
    window.location = "/admin/monitor#search=" + id
  },
  workflow (id) {
    App.navigate('/admin/workflow/' + id)
  },
  createMany (hosts, data) {
    const done = after(hosts.length, () => {
      App.state.alerts.success('Success', 'Monitor created.')
    })

    hosts.forEach(host => {
      let monitorData = assign({}, data, { host_id: host })
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
  const url = `${config.api_url}/resource/${id}/alerts`
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
