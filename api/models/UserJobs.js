module.exports = {
  // Enforce model schema in the case of schemaless databases
  schema: false, 
  tableName: 'web_user_jobs',
  attributes: {
    user_id: { type:'string'  , index : true },
    username: { type:'string' },
    job_eid: { type:'string'  , index : true }
  }
};
