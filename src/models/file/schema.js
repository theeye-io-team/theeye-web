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
    template_id: 'string',
    _type: { type: 'string', default: 'File' },
    data: { type: 'string' }
	},
  session: {
    is_script: { type: 'boolean', default: false },
  },
  parse (args) {
    if (args.data) args.data = this.decodeData(args.data)
    args.is_script = (args._type == 'Script')
    return args
  },
  serialize (options) {
    var serial = AppModel.prototype.serialize.call(this, options)
    serial.data = this.encodeData(serial.data)
    return serial
  },
  encodeData (data) {
    return window.btoa(encodeURIComponent(data).replace(/%([0-9A-F]{2})/g, (match, p1) => {
      return String.fromCharCode('0x' + p1)
    }))
  },
  decodeData (data) {
    return decodeURIComponent(Array.prototype.map.call(window.atob(data), (c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))
  },
  derived: {
    hasTemplate: {
      deps: ['template_id'],
      fn () {
        return Boolean(this.template_id) === true
      }
    },
    formatted_tags: {
      deps: ['name', 'filename', 'tags', 'extension', 'mimetype'],
      fn () {
        return [
          'name=' + this.name,
          'filename=' + this.filename,
          'extension=' + this.extension,
          'mimetype=' + this.mimetype
        ].concat(this.tags)
      }
    }
  }
})
