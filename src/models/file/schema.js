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
		tags: { type: 'array', default: () => { return [] } },
    input_mode: { type: 'string', default: 'editor' },
    _type: { type: 'string', default: 'File' },
    data: { type: 'string' }
	},
  parse (args) {
    if (args.data) {
      args.data = this.decodeData(args.data)
    }
    return args
  },
  encodeData (data) {
    return window.btoa(encodeURIComponent(data).replace(/%([0-9A-F]{2})/g, (match, p1) => {
      return String.fromCharCode('0x' + p1)
    }))
  },
  decodeData (data) {
    return decodeURIComponent(Array.prototype.map.call(atob(data), (c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))
  },
})
