import App from 'ampersand-app'
import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'

const urlRoot = function () {
  return `${App.config.api_url}/policy`
}

const RuleModel = AppModel.extend({
  props: {
    name: 'string',
    id: 'string',
    method: 'string',
    path: 'string',
    //params: 'object',
  }
})

//
// default policies
//
// FetchTask => GET /task
// ejemplo:
//
// { method: 'get', path: '/task', name: 'FetchTasks' }
//
// GetTask => GET /task/${id}
//
// { method: 'get', path: '/task/${task}', name: 'GetTask' }
//
const RulesCollection = AppCollection.extend({
  indexes: ['id'],
  model: RuleModel
})

const Model = AppModel.extend({
  urlRoot,
  props: {
    name: 'string',
    id: 'string'
  },
  collections: {
    rules: RulesCollection
  }
})

const Collection = AppCollection.extend({
  url: urlRoot,
  indexes: ['id'],
  model: Model
})

export { Model, Collection }
