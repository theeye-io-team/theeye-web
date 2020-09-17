import AppModel from 'lib/app-model'
import App from 'ampersand-app'
import moment from 'moment'

import Collection from 'ampersand-collection'
import State from 'ampersand-state'

// require to render collections and bind events to properties of elements in the collection
const LinkedModels = Collection.extend({
  model: State.extend({
    props: {
      id: 'string',
      name: 'string',
      _type: 'string'
    }
  })
})

export default AppModel.extend({
  props: {
    id: 'string',
    customer_id: { type: 'string' },
    customer_name: { type: 'string' },
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
    //_type: { type: 'string', default: 'File' },
    template_id: 'string',
    source_model_id: 'string', // temporal , is used to create templates
    creation_date: { type: 'date', default: () => { return new Date() } },
    last_update: { type: 'date', default: () => { return new Date() } },
    data: { type: 'string' }
	},
  session: {
    is_script: { type: 'boolean', default: false },
  },
  collections: {
    linked_models: LinkedModels
  },
  parse (args) {
    args.is_script = (args._type == 'Script')
    return args
  },
  derived: {
    summary: {
      deps: ['filename','creation_date'],
      fn () {
        let date = moment(this.creation_date).format('YYYY/MM/DD HH:mm A')
        return `${this.filename} - ${date}`
      }
    },
    hasTemplate: {
      deps: ['template_id'],
      fn () {
        return Boolean(this.template_id) === true
      }
    },
    formatted_tags: {
      deps: ['name','filename','tags','extension','mimetype','linked_models'],
      fn () {
        let tags = [
          'name=' + this.name,
          'filename=' + this.filename,
          'extension=' + this.extension,
          'mimetype=' + this.mimetype
        ]

        if (this.linked_models.length > 0) {
          tags.push('linked_models')
        }

        return tags.concat(this.tags)
      }
    }
  },
  dataFromBase64 (data) {
    this.data = decodeUnicodeData(data)
    return this.data
  }
})

const encodeUnicodeData = (data) => {
  return window.btoa(encodeURIComponent(data).replace(/%([0-9A-F]{2})/g, (match, p1) => {
    return String.fromCharCode(parseInt(p1, 16))
  }))
}

const decodeUnicodeData = (data) => {
  return decodeURIComponent(Array.prototype.map.call(window.atob(data), (c) => {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  }).join(''))
}
