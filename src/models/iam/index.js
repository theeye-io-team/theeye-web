import App from 'ampersand-app'
import AmpersandState from 'ampersand-state'
import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'
import ClearableCollection from 'lib/clearable-collection'

import Roles from './roles'

const actionsUrlRoot = function () {
  return `${App.config.api_url}/actions`
}

/**
 *
 * actions can be built-in or re-defined to match specific access control
 *
 */
const Action = AppModel.extend({
  urlRoot: actionsUrlRoot,
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
  url: actionsUrlRoot,
  indexes: ['id'],
  mainIndex: 'text',
  model: Action
})

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

const SupervisorActionsCatalog = ActionsCollection.extend({
  url: function () {
    return `${App.config.supervisor_api_url}/api/catalog`
  },
})

export {
  //Policy,
  //PoliciesCollection,
  Action,
  ActionsCollection,
  Role,
  RolesCollection,
  SupervisorActionsCatalog
}
