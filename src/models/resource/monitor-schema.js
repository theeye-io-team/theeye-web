import AppModel from 'lib/app-model'
module.exports = AppModel.extend({
  props: {
    id: 'string',
    customer_id: 'string',
    customer_name: 'string',
    looptime: 'number',
    name: 'string',
    description: 'string',
    type: 'string',
    _type: 'string',
    //config: ['object',false, () => { return {} }],
    tags: 'array',
    source_model_id: 'string', // temporal , is used to create templates
  },
  derived: {
    summary: {
      deps: ['name'],
      fn () {
        return `resource monitor ${this.name}`
      }
    }
  }
})
