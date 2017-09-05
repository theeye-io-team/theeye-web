import AppModel from 'lib/app-model'

module.exports = AppModel.extend({
	props: {
    id: 'string',
		customer_id: { type: 'string' },
		customer_name: { type: 'string' },
		user_id: { type: 'string' },
		filename: { type: 'string' },
		keyname: { type: 'string' },
		mimetype: { type: 'string' },
		extension: { type: 'string' },
		size: { type: 'number' },
		description: { type: 'string' },
		md5: { type: 'string' },
		public: { type: 'boolean', default: false },
		tags: { type: 'array', default: () => { return [] } }
	},
  //children: {
  //  customer: Customer,
  //}
})
