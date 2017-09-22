'use strict'

import App from 'ampersand-app'
import XHR from 'lib/xhr'
import bootbox from 'bootbox'
//import merge from 'lodash/merge'
import config from 'config'

import { Collection as Hosts } from 'models/host'
import { Model as HostGroup } from 'models/hostgroup'

module.exports = {
  create (data) {
    const state = App.state.hostGroupPage
    const resources = state.configResources.serialize()
    const tasks = state.configTasks.serialize()
    const triggers = state.configTriggers.serialize()

    const body = Object.assign({}, data, {
      resources: resources,
      tasks: tasks,
      triggers: triggers
    })

    XHR.send({
      url: `${config.api_url}/hostgroup`,
      method: 'post',
      jsonData: body,
      withCredentials: true,
      timeout: 5000,
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done (data,xhr) {
        App.state.hostGroups.add(data)
        bootbox.alert('Host Template created')
      },
      fail (err,xhr) {
        bootbox.alert('Something goes wrong. Please refresh')
      }
    })
  },
  update (id, data) {
    const body = Object.assign({},data)

    XHR.send({
      url: `${config.api_url}/hostgroup/${id}`,
      method: 'put',
      jsonData: body,
      withCredentials: true,
      timeout: 5000,
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done (data,xhr) {
        const group = App.state.hostGroups.get(data.id)
        group.set(data)
        bootbox.alert('Host Template updated')
      },
      fail (err,xhr) {
        bootbox.alert('Something goes wrong. Please refresh')
      }
    })
  },
  remove (id) {
    XHR.send({
      url: `${config.api_url}/hostgroup/${id}`,
      method: 'delete',
      headers: { Accept:'application/json;charset=UTF-8' },
      withCredentials: true,
      done (data,xhr) {
        App.state.hostGroups.remove(id)
        bootbox.alert('Host Template removed')
      },
      fail (err,xhr) {
        bootbox.alert('Something goes wrong. Please refresh')
      },
      timeout: 5000
    })
  },
  fetchHostConfig (id) {
    App.state.hostGroupPage.fetchConfig(id, (err) => {
      if (err) bootbox.alert(err)
    })
  },
  //
  // remove this config before create the template.
  // this actions is before the template is being created in the API
  // the Template doesn't exist yet
  //
  removeConfig (item) {
    item.collection.remove(item)
  },
  searchHostsByRegex (regex) {
    App.state.hostsByRegex.fetch({
      data: {
        filter: {
          where: {
            hostname: { $regex: regex }
          }
        }
      },
      //success: () => {
      //}
    })
  }
}
