import AppModel from 'lib/app-model'
module.exports = AppModel.extend({
  props: {
    id: 'string',
    customer_id: 'string',
    customer_name: 'string',
    looptime: 'number',
    name: 'string',
    type: 'string',
    _type: 'string',
    config: ['object',false, () => { return {} }],
    tags: 'array',
  }
})