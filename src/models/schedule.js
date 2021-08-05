import App from 'ampersand-app'
import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'
import config from 'config'

const urlRoot = function () {
  return `${config.supervisor_api_url}/scheduler`
}

const Model = AppModel.extend({
  urlRoot,
  idAttribute: '_id',
  props: {
    //id: 'string', //// should use 'id' instead . need to migrate/improve backend to include the 'id' attribute in the reponse data
    _id: 'string',
    name: 'string',
    data: 'object',
    type: 'string',
    priority: 'number',
    nextRunAt: 'string',
    lastFinishedAt: 'string',
    lastRunAt: 'string',
    // lastModifiedBy: '' // ???
    disabled: ['boolean', true, false]
  }
})

const Collection = AppCollection.extend({
  url: urlRoot,
  mainIndex: '_id',
  model: Model
})

export { Model, Collection }
