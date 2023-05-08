

/**
 * this is going to be separated and fetched from the api
 * ideally from swagger/openapi
 */
const openAPI = {
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
 * permisos de la app
 *
 */
const permissions = [
  {
    id: '1',
    builtin: true,
    name: 'get all tasks definitions',
    rules: [
      openAPI.task[0]
    ]
  },
  {
    id: '2',
    builtin: true,
    name: 'get task',
    rules: [
      openAPI.task[1]
    ]
  }
]

/**
 *
 * default roles
 *
 */
const roles = [
  {
    builtIn: true,
    id: 'viewer',
    name: 'viewer',
    description: 'Viewers',
    permissions: []
  },
  {
    builtIn: true,
    id: 'user',
    name: 'user',
    description: 'Users',
    permissions: []
  },
  {
    builtIn: true,
    id: 'manager',
    name: 'manager',
    description: 'Managers', 
    permissions: []
  },
  {
    builtIn: true,
    id: 'admin',
    name: 'admin',
    description: 'Administrators' ,
    permissions: []
  },
  {
    builtIn: true,
    id: 'owner',
    name: 'owner',
    description: 'Owners',
    permissions: []
  }
]

export { openAPI, permissions, roles }
