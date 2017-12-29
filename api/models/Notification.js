// this model is reflected on /src/models/notification
var Notification = {
  // Enforce model schema in the case of schemaless databases
  schema: true,
  tableName: 'web_notification',
  attributes: {
    //customer_id: { type: 'string', required: true, notNull: true },
    customer_name: { type: 'string', required: true, notNull: true },
    user_id: { type: 'string', required: true, notNull: true },
    topic: { type: 'string' },
    event_id: { type: 'string' },
    read: { type: 'boolean', defaultsTo: false },
    data: { type: 'json' }
  }
}

module.exports = Notification
