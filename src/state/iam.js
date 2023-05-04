
import { PoliciesCollection, CredentialsCollection } from 'models/policy'

/**
 * this is going to be separated and fetched from the api
 * ideally from swagger/openapi
 */
const OpenAPI = {
  task: [
    {
      name: 'fetch tasks',
      id: 'fetchTasks',
      method: 'get',
      path: '/task'
    },
    {
      name: 'get task',
      id: 'getTask',
      method: 'get',
      path: '/task/:task'
    }
  ],
  workflow: [],
  webhook: [],
  indicator: []
}

/**
 *
 * policies armadas a medida.
 *
 */
const Policies = new PoliciesCollection([
  { 
    id: '1',
    builtin: false,
    name: 'Query All Tasks Definitions',
    rules: [
      OpenAPI.task[0]
    ]
  },
  {
    id: '2',
    builtin: true,
    name: 'View Task Definition',
    rules: [
      openAPI.task[1]
    ]
  }
])

/**
 *
 * default roles
 *
 */
const Roles = new CredentialsCollection([
  { order: 1, id: 'viewer', name: 'viewer', description: 'Viewer' },
  { order: 2, id: 'user', name: 'user', description: 'User' },
  { order: 3, id: 'manager', name: 'manager', description: 'Manager' },
  { order: 4, id: 'admin', name: 'admin', description: 'Admin' },
  { order: 5, id: 'owner', name: 'owner', description: 'Owner' }
])

export { OpenAPI, Policies, Roles }
