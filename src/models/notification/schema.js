import AppModel from 'lib/app-model'

// this model is bound to that on /api/models/notification
module.exports = AppModel.extend({
  props: {
    id: 'string',
    user_id: {type: 'string', required: true},
    event_id: {type: 'string', required: true},
    topic: {type: 'string', required: true},
    notified: {type: 'boolean', default: false},
    read: {type: 'boolean', default: false},
    data: {type: 'object'},
    // automagic sails fields
    createdAt: 'date',
    updatedAt: 'date'
  }
})
