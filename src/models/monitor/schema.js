import State from 'ampersand-state'
import AppModel from 'lib/app-model'
//import { Model as Customer } from 'models/customer'

module.exports = AppModel.extend({
  props: {
    id: 'string',
    customer_id: 'string',
    customer_name: 'string',
    looptime: 'number',
    name: 'string',
    type: 'string',
    _type: 'string',
    config: 'object',
    tags: 'array',
  }
  //children: {
  //  customer: Customer
  //}
})
