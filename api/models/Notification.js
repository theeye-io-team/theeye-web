// this model is reflected on /src/models/notification
var Notification = {
  // Enforce model schema in the case of schemaless databases
  schema: true,
  tableName: 'web_notification',
  attributes: {
    user_id: {type: 'string', required: true, notNull: true},
    //event_id: {type: 'string', required: true, notNull: true},
    topic: {type: 'string', required: true, notNull: true, truthy: true},
    notified: {type: 'boolean', defaultsTo: false},
    read: {type: 'boolean', defaultsTo: false},
    data: {type: 'json'}
  }
}

module.exports = Notification
