import App from 'ampersand-app'
import AppModel from 'lib/app-model'
import Collection from 'ampersand-collection'
import AppCollection from 'lib/app-collection'
import ClearableCollection from 'lib/clearable-collection'
import State from 'ampersand-state'
//const State = AmpersandState.extend({ extraProperties: 'allow' })
import BasicRoles from './roles'

/**
 *
 * actions can be built-in or re-defined to match specific access control
 *
 */
const Action = State.extend({
  props: {
    service: 'string',
    name: 'string',
    method: 'string',
    path: 'string',
    params: 'object'
  }
})

// this is the collection of all actions
const ActionsCollection = Collection.extend({
  indexes: ['name'],
  mainIndex: 'name',
  model: Action,
  comparator: (model) => model.name
})

/** 
 * this is a state, not a model.
 * there is no api endpoint available for roles yet
 */
const roleUrlRoot = function () {
  return `${App.config.api_url}/role`
}

const Role = AppModel.extend({
  urlRoot: roleUrlRoot,
  props: {
    id: 'string',
    builtin: [ 'boolean', true, false ],
    name: 'string',
    description: 'string',
  },
  collections: {
    actions: ActionsCollection
  }
})

const CredentialsCollection = ClearableCollection.extend({
  model: Role,
  initialize () {
    this.initialState = BasicRoles
    ClearableCollection.prototype.initialize.apply(this, arguments)
  }
})

const RolesCollection = AppCollection.extend({ url: roleUrlRoot, model: Role })

const SupervisorServicesCatalog = AppCollection.extend({
  model: State.extend({
    props: {
      name: 'string',
      actions: 'array'
    }
  }),
  comparator: (model) => model.name,
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
  CredentialsCollection,
  RolesCollection,
  SupervisorServicesCatalog,
  //GatewayServicesCatalog
}
