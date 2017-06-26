'use strict'

import App from 'ampersand-app'
import XHR from 'lib/xhr'
import bootbox from 'bootbox'
import assign from 'lodash/assign'

import { Model as HostGroup } from 'models/hostgroup'

export default {
  create (data) {
    const body = assign({},data,{
      resources: App.state.hostGroupPage.configResources,
      tasks: App.state.hostGroupPage.configTasks,
      triggers: App.state.hostGroupPage.configTriggers
    })

    XHR({
      url: `/api/hostgroup`,
      method: 'post',
      jsonData: body,
      withCredentials: true,
      timeout: 5000,
      headers: {
        Accepts: 'application/json;charset=UTF-8'
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
    //const body = assign({},data,{
    //  resources: App.state.hostGroupPage.configResources,
    //  tasks: App.state.hostGroupPage.configTasks,
    //  hostTriggers: App.state.hostGroupPage.configTriggers
    //})
    const body = assign({},data)

    XHR({
      url: `/api/hostgroup/${id}`,
      method: 'put',
      jsonData: body,
      withCredentials: true,
      timeout: 5000,
      headers: {
        Accepts: 'application/json;charset=UTF-8'
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
    XHR({
      url: `/api/hostgroup/${id}`,
      method: 'delete',
      headers: {
        Accepts:'application/json;charset=UTF-8'
      },
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
  }
}
