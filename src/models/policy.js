import App from 'ampersand-app'
import Collection from 'ampersand-collection'
import AmpersandState from 'ampersand-state'
import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'

const urlRoot = function () {
  return `${App.config.api_url}/policy`
}

const Rule = AppModel.extend({
  props: {
    id: 'string',
    text: 'string',
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
// { method: 'get', path: '/task', name: 'fetch-tasks' }
//
// GetTask => GET /task/${id}
//
// { method: 'get', path: '/task/${task}', name: 'get-task' }
//
const RulesCollection = AppCollection.extend({
  indexes: ['id'],
  mainIndex: 'text',
  model: Rule
})

/**
 *
 * An access Policy has a set of Rules.
 *
 */
const Policy = AppModel.extend({
  urlRoot,
  props: {
    name: 'string',
    id: 'string',
    customer: 'string',
    customer_id: 'string',
    builtin: ['boolean', true, false]
  },
  collections: {
    rules: RulesCollection
  }
})

const PoliciesCollection = AppCollection.extend({
  url: urlRoot,
  indexes: ['id'],
  model: Policy
})

const State = AmpersandState.extend({ extraProperties: 'allow' })
/** 
 * this is a state, not a model.
 * there is no api endpoint available for roles yet
 */
const Role = State.extend({
  props: {
    name: 'string',
    order: 'number',
    description: 'string',
    id: 'string'
  }
})

const CredentialsCollection = Collection.extend({ model: Role })

export {
  Policy,
  PoliciesCollection,
  Rule,
  RulesCollection,
  CredentialsCollection,
  Role
}
