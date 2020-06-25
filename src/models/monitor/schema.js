import AppModel from 'lib/app-model'
export default AppModel.extend({
  props: {
    id: 'string',
    name: 'string',
    description: 'string',
    type: ['string', false, 'monitor'],
    _type: ['string', false, 'Monitor'],
    tags: 'array',
    looptime: 'number',
    customer_id: 'string',
    customer_name: 'string',
    source_model_id: 'string', // it is template created from a model instance
    template_resource_id: 'string', // belongs to a resource template
    hostgroup_id: 'string' // belongs to a template
  },
  derived: {
    summary: {
      deps: ['name'],
      fn () {
        return `monitor ${this.name}`
      }
    }
  }
})
