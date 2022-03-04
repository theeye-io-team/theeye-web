import App from 'ampersand-app'
import XHR from 'lib/xhr'
import bootbox from 'bootbox'
import FileSaver from 'file-saver'
import qs from 'qs'

const Actions = {
  create (data) {
    const state = App.state.hostGroupPage
    const resources = state.resources.serialize()
    const tasks = state.tasks.serialize()
    const triggers = state.triggers.serialize()
    const files = state.files.serialize()

    const body = Object.assign({}, data, {
      resources,
      tasks,
      files,
      triggers
    })

    XHR.send({
      url: `${App.config.supervisor_api_url}/${App.state.session.customer.name}/hostgroup`,
      method: 'POST',
      jsonData: body,
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done (data,xhr) {
        App.state.hostGroups.add(data)
        App.state.alerts.success('Success', 'Template created')
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
      url: `${App.config.supervisor_api_url}/${App.state.session.customer.name}/hostgroup/${id}`,
      method: 'PUT',
      jsonData: body,
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done (data,xhr) {
        const group = App.state.hostGroups.get(data.id)
        group.set(data)
        App.state.alerts.success('Success', 'Template updated')
      },
      fail (err,xhr) {
        bootbox.alert('Something goes wrong. Please refresh')
      }
    })
  },
  remove (id, deleteInstances) {
    XHR.send({
      url: `${App.config.supervisor_api_url}/${App.state.session.customer.name}/hostgroup/${id}?deleteInstances=${deleteInstances}`,
      method: 'DELETE',
      headers: { Accept:'application/json;charset=UTF-8' },
      done (data,xhr) {
        App.state.hostGroups.remove(id)
        App.state.alerts.success('Success', 'Template removed')
      },
      fail (err,xhr) {
        bootbox.alert('Something goes wrong. Please refresh')
      },
    })
  },
  resetTemplatesConfig () {
    App.state.hostGroupPage.resetCollection()
  },
  fetchHostConfig (id,next) {
    XHR.send({
      method: 'GET',
      url: `${App.config.supervisor_api_url}/recipe/host/${id}/config`,
      done: (data, xhr) => {
        this.resetTemplatesConfig()
        App.state.hostGroupPage.setConfigs(data)
        //next(null,data)
      },
      fail (err,xhr) {
        bootbox.alert('Fail to fetch host config')
      }
    })
  },
  readRecipeConfig (recipe) {
    this.resetTemplatesConfig()
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
  },
  exportToJSON (model) {
    this.fetchRecipe({ hostgroup_id: model.id }, function (err, instructions) {
      if (!err) {
        var jsonContent = JSON.stringify(instructions)
        var blob = new Blob([jsonContent], {type: 'application/json'})
        FileSaver.saveAs(blob, `${model.name.replace(' ', '_')}.json`)
      }
    })
  },
  fetchRecipe (where, next) {
    let query = qs.stringify({ where })
    next || (next = () => {})

    XHR.send({
      method: 'GET',
      url: `${App.config.supervisor_api_url}/recipe?${query}`,
      done: (data, xhr) => {
        if (data.length) {
          next(null, data[0].instructions)
        } else {
          let msg = 'Sorry, template recipe not found. Please create this template again to be able to export it.'
          bootbox.alert(msg)
          return next(new Error(msg))
        }
      },
      fail (err, xhr) {
        let msg = 'Error retrieving template recipe.'
        bootbox.alert(msg)
        return next(new Error(msg))
      }
    })
  }
}

export default Actions
