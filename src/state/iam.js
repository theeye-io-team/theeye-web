

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
 * policies armadas a medida.
 *
 */
const policies = [
  { 
    id: '1',
    builtin: false,
    name: 'Query All Tasks Definitions',
    rules: [
      openAPI.task[0]
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
]

/**
 *
 * default roles
 *
 */
const groups = [
  {
    builtIn: true,
    order: 1,
    id: 'viewer',
    name: 'Viewers',
    credential: 'viewer',
    description: 'Viewers'
  },
  {
    builtIn: true,
    order: 2,
    id: 'user',
    name: 'Users',
    credential: 'user',
    description: 'Users'
  },
  { 
    builtIn: true,
    order: 3,
    id: 'manager',
    name: 'Managers',
    credential: 'manager',
    description: 'Managers' 
  },
  { 
    builtIn: true,
    order: 4,
    id: 'admin',
    name: 'Administrators',
    credential: 'admin',
    description: 'Administrators' 
  },
  { 
    builtIn: true,
    order: 5,
    id: 'owner',
    name: 'Owners',
    credential: 'owner',
    description: 'Owners'
  }
]

export { openAPI, policies, groups }
