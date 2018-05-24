'use strict'

import App from 'ampersand-app'
import XHR from 'lib/xhr'
import bootbox from 'bootbox'
import config from 'config'

import { Collection as Hosts } from 'models/host'
import { Model as HostGroup } from 'models/hostgroup'

const Actions = {
  create (data, applyToSourceHost) {
    const state = App.state.hostGroupPage
    const resources = state.configResources.serialize()
    const tasks = state.configTasks.serialize()
    const triggers = state.configTriggers.serialize()

    const body = Object.assign({}, data, {
      resources: resources,
      tasks: tasks,
      triggers: triggers,
      applyToSourceHost: applyToSourceHost
    })

    XHR.send({
      url: `${config.api_url}/hostgroup`,
      method: 'POST',
      jsonData: body,
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
  update (id, data, deleteInstances) {
    const body = Object.assign({},data,{
      deleteInstances: deleteInstances
    })

    XHR.send({
      url: `${config.api_url}/hostgroup/${id}`,
      method: 'PUT',
      jsonData: body,
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
  remove (id, deleteInstances) {
    XHR.send({
      url: `${config.api_url}/hostgroup/${id}?deleteInstances=${deleteInstances}`,
      method: 'DELETE',
      headers: { Accept:'application/json;charset=UTF-8' },
      done (data,xhr) {
        App.state.hostGroups.remove(id)
        bootbox.alert('Host Template removed')
      },
      fail (err,xhr) {
        bootbox.alert('Something goes wrong. Please refresh')
      },
    })
  },
  fetchHostConfig (id,next) {
    XHR.send({
      method: 'GET',
      url: `${config.api_url}/host/${id}/config`,
      done (data,xhr) {
        App.state.hostGroupPage.setConfigs(data)
        //next(null,data)
      },
      fail (err,xhr) {
        bootbox.alert('Fail to fetch host config')
      }
    })
  },
  importTemplateConfigFromRecipe (recipeId) {
    this.fetchRecipe(recipeId, (err,recipe) => {
      if (!err) {
        this.createTemplateFromRecipe(recipe)
      }
    })
  },
  fetchRecipe (id, next) {
    XHR.send({
      method: 'GET',
      url: `${config.api_v3_url}/recipe/${id}`,
      done: (data,xhr) => {
        next(null, data.instructions)
      },
      fail (err,xhr) {
        let msg = 'Sorry, we fail to fetch the recipe'
        bootbox.alert(msg)
        return next(new Error(msg))
      }
    })
  },
  readRecipeConfig (recipe) {
    App.state.hostGroupPage.setConfigs(recipe)
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

export default Actions
