import App from 'ampersand-app'
import XHR from 'lib/xhr'
import bootbox from 'bootbox'
import FileSaver from 'file-saver'

const Actions = {
  create (data) {
    const state = App.state.hostGroupPage
    const resources = state.resources.serialize()
    const tasks = state.tasks.serialize()
    const triggers = state.triggers.serialize()

    const files = []
    for (let file of state.files.models) {
      files.push( file.serialize({encode:true}) )
    }

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
    const body = Object.assign({}, data, { deleteInstances })

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
  getHostTemplate (id) {
    XHR.send({
      method: 'GET',
      url: `${App.config.supervisor_api_url}/host/${id}/template`,
      done: (data, xhr) => {
        this.resetTemplatesConfig()
        App.state.hostGroupPage.setConfigs(data)
      },
      fail (err,xhr) {
        bootbox.alert('Fail to fetch host config')
      }
    })
  },
  readRecipeConfig (recipe) {
    if (recipe.files) {
      for (let index = 0; index < recipe.files.length; index++) {
        const data = recipe.files[index].data
        // old base 64 recipe, whithout metadata
        if (/^data:.*;base64,.*$/.test(data) === false) {
          recipe.files[index].data = `data:text/plain;base64,${data}`
        }
      }
    }

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
    this.getSerialization(model, (err, instructions) => {
      if (!err) {
        var jsonContent = JSON.stringify(instructions)
        var blob = new Blob([jsonContent], {type: 'application/json'})
        FileSaver.saveAs(blob, `${model.name.replace(' ', '_')}_template.json`)
      }
    })
  },
  getSerialization (model, next) {
    XHR.send({
      method: 'GET',
      url: `${App.config.supervisor_api_url}/hostgroup/${model.id}/serialize`,
      done: (data, xhr) => {
        next(null, data)
      },
      fail (err, xhr) {
        App.state.alerts.danger('The template is not available')
        return next(err)
      }
    })
  }
}

export default Actions
