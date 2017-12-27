
import AppCollection from 'lib/app-collection'

const Schema = require('./schema')
const config = require('config')

const urlRoot = `${config.app_url}/inbox`
const Model = Schema.extend({ urlRoot: urlRoot })

const Collection = AppCollection.extend({
  comparator: function (a, b) {
    return b.createdAt - a.createdAt
  },
  model: Model,
  url: urlRoot
})

exports.Model = Model
exports.Collection = Collection
