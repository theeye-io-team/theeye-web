import AppModel from 'lib/app-model'

import { Model as User } from 'models/user'
import { Model as Customer } from 'models/customer'

export default AppModel.extend({
	props: {
    id: 'string',
		user_id: 'string', // owner/creator
		customer_id: 'string',
		customer_name: 'string',
		description: 'string',
		name: 'string',
		type: 'string',
		_type: 'string',
		acl: 'array',
		failure_severity: 'string',
		alerts: 'boolean',
    tags: 'array'
	},
  children: {
    customer: Customer,
    user: User,
  }
})
