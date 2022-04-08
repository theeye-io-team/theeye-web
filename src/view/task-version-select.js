import App from 'ampersand-app'
import qs from 'qs'
import XHR from 'lib/xhr'
import SelectView from 'components/select2-view'
import FilteredCollection from 'ampersand-filtered-subcollection'

export default SelectView.extend({
  initialize (specs) {
    this.options = []
    this.multiple = false
    this.tags = false
    this.label = specs.label || 'Task'
    this.name = specs.name || 'task'
    this.styles = 'form-group'
    this.unselectedText = 'select a task'
    this.idAttribute = 'id'
    this.textAttribute = 'summary'
    //this.allowCreateTags = false

    SelectView.prototype.initialize.apply(this, arguments)

    const url = `${App.config.supervisor_api_url}/task/version`
    return XHR.send({
      url,
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      method: 'GET',
      done: (data) => {
        const tasks = data.map(task => {
          //return new App.Models.Task.Factory(task, {store:false})
          return new App.Models.Task.Factory(task)
        })
        this.options = tasks
      },
      fail: (err, xhr) => {
        failure()
      }
    })
  }
})
