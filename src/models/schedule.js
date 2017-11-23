import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'
// const config = require('config')

const Model = AppModel.extend({
  idAttribute: '_id',
  props: {
    //id: 'string', //// should use 'id' instead . need to migrate/improve backend to include the 'id' attribute in the reponse data
    _id: 'string',
    name: 'string',
    data: 'object',
    type: 'string',
    priority: 'number',
    nextRunAt: 'string',
    lastFinishedAt: 'string',
    lastRunAt: 'string'
    // lastModifiedBy: '' // ???
  }
})

const Collection = AppCollection.extend({
  // url: `${config.api_url}/schedule`,
  mainIndex: '_id',
  model: Model
})

exports.Model = Model
exports.Collection = Collection
