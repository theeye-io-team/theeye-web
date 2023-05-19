import App from 'ampersand-app'
import AmpersandState from 'ampersand-state'
import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'
import ClearableCollection from 'lib/clearable-collection'

import Roles from './roles'

const urlRoot = function () {
  return `${App.config.api_url}/roles`
}

/**
 *
 * actions can be built-in or re-defined to match specific access control
 *
 */
const Action = AppModel.extend({
  props: {
    name: 'string',
    method: 'string',
    path: 'string',
    params: 'object',
    role: 'string'
  }
})

// this is the collection of all actions
const ActionsCollection = AppCollection.extend({
  indexes: ['id'],
  mainIndex: 'text',
  model: Action
})

//const Policy = AppModel.extend({
//  urlRoot,
//  props: {
//    name: 'string',
//    id: 'string',
//    customer: 'string',
//    customer_id: 'string',
//    builtin: ['boolean', true, false]
//  },
//  collections: {
//    rules: RulesCollection
//  }
//})

//const PoliciesCollection = AppCollection.extend({
//  url: urlRoot,
//  indexes: ['id'],
//  model: Policy
//})

const State = AmpersandState.extend({ extraProperties: 'allow' })

/** 
 * this is a state, not a model.
 * there is no api endpoint available for roles yet
 */
const Role = State.extend({
  props: {
    builtin: ['boolean', true, false],
    name: 'string',
    level: 'number',
    description: 'string',
    id: 'string'
  },
  collections: {
    actions: ActionsCollection
  }
})

const RolesCollection = ClearableCollection.extend({
  model: Role,
  initialize () {
    this.initialState = Roles
    ClearableCollection.prototype.initialize.apply(this, arguments)
  },
  sort: 'level'
})

export {
  //Policy,
  //PoliciesCollection,
  Action,
  ActionsCollection,
  Role,
  RolesCollection
}
