import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'
// const config = require('config')

export const Model = AppModel.extend({
  props: {
    _id: 'string',
    name: 'string',
    data: 'object',
    type: 'string',
    priority: 'number',
    nextRunAt: 'date'
    // lastModifiedBy: '' // ???
  }
})

export const Collection = AppCollection.extend({
  mainIndex: '_id',
  // url: `${config.api_url}/schedule`,
  model: Model
})
