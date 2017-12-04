import AppCollection from 'lib/app-collection'
const Schema = require('./schema')
const config = require('config')

const urlRoot = `${config.api_url}/file`
const Model = Schema.extend({ urlRoot: urlRoot })

const Collection = AppCollection.extend({
  comparator: 'filename',
  model: Model,
  url: urlRoot,
})

exports.Model = Model
exports.Collection = Collection
