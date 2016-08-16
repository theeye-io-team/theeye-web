var supervisor = sails.config.supervisor ;

module.exports = {
  jobs : function jobsUri(user) {
    var parts = [
      supervisor.url ,
      user.customers[0] ,
      ':hostname:',
      supervisor.palancas.resource
    ];

    return parts.join('/');
  }
};
