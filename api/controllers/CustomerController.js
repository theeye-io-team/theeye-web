
const logger = require('../libs/logger')('controllers:apiv2')

var CustomerController = module.exports = {
  /**
   * @route GET /customer
   */
  fetch (req, res) {
    var supervisor = req.supervisor;
    supervisor.fetch({
      route:'/customer',
      success: customers => {
        res.send(200, customers)
      },
      failure: err => {
        logger.error('%o',err);
        res.send(err.statusCode,err);
      }
    });
  },
  /**
   *
   * GET  /customer/:id
   *
   */
  getcustomer (req, res) {
    req.supervisor.get({
      route:'/customer',
      id:req.params.id,
      success: customer => res.send(200, customer),
      failure: err => res.send(err.statusCode, err)
    });
  },
  //POST  /customer/:id
  create (req, res) {
    var params = req.params.all()
    req.supervisor.create({
      route:'/customer',
      body: params,
      success: customer => res.send(200, customer),
      failure: err => res.send(err.statusCode, err)
    });
  },
  /**
   * @method PUT
   * @route /customer/:id
   * @param {String} id
   */
  edit (req, res) {
    var body = req.body;
    req.supervisor.patch({
      route:'/customer',
      id: req.params.id,
      body: req.allParams(),
      success: customer => res.json(200,customer),
      failure: err => res.send(err.statusCode,err)
    });
  },
  /**
   * @method PUT
   * @route /customer/:id/config
   * @param {String} id
   */
  editconfig (req, res) {
    var config = req.body
    if (!config) {
      res.send(400, 'Integrations config is missing.')
    }
    req.supervisor.patch({
      route:`/customer/${req.params.id}/config`,
      body: config,
      success: config => res.json(200, config),
      failure: err => res.send(err.statusCode,err)
    });
  },
  /**
   * @method DELETE
   * @route /customer/:id
   * @param {String} id
   */
  remove (req, res) {
    req.supervisor.remove({
      route: '/customer',
      id: req.params.id,
      success: customer => {
        User.find({}, function(error, users){
          for (var i=0; i<users.length; i++) {
            var user = users[i];
            var idx = user.customers.indexOf(customer.name);
            if (idx !== -1) {
              var removed = user.customers.splice(idx, 1);
              user.save(function (error) {
                if(error) logger.error('unable to update user "%s" customers', user.username);
              });
            }
          }
        });

        Passport.find({}, function(error, passports){
          for (var i=0; i<passports.length; i++) {
            var passport = passports[i];
            if(passport.profile) {
              var idx = passport.profile.customers.findIndex(elem => elem.name == customer.name);
              if (idx !== -1) {
                var removed = passport.profile.customers.splice(idx, 1);
                passport.save(function (error) {
                  if(error) logger.error('unable to update passport "%s" customers', passport.profile.username);
                });
              }
            }
          }
        });

        return res.send(204);
      },
      failure: err => {
        logger.error('%o',err);
        return res.json(err.statusCode, err);
      }
    });
  },
  /**
   * @method GET
   * @route /customer/agent
   */
  getuseragent (req, res) {
    var supervisor = req.supervisor;
    var customer_name = req.user.current_customer
    var theeye = passport.protocols.theeye;
    theeye.getCustomerAgentCredentials(
      customer_name,
      supervisor,
      function(err, user){
        if(err) return res.send(500);
        if(!user) return res.send(404);
        return res.send(200, { user: user });
      }
    )
  },
  autobot (req, res, next) {
    const supervisor = req.supervisor
    // current customer
    const customer_name = req.user.current_customer
    const theeye = passport.protocols.theeye

    theeye.getCustomerAgentCredentials(
      customer_name,
      supervisor,
      (err, agent) => {
        if (err) { return res.send(500) }
        if (!agent) { return res.send(404) }

        let autobot = sails.config.supervisor.integrations.autobot

        /**
         *
         * Order is important
         *
         * @summary create a bot via task
         *
         * client_id argument 0
         * client_secret argument 1
         * client_customer argument 2
         * supervisor_api_url argument 3
         * botname argument 4
         *
         */
        let payload = {
          task: autobot.task_id,
          task_arguments: [
            { order: 0, value: agent.client_id },
            { order: 1, value: agent.client_secret },
            { order: 2, value: customer_name },
            { order: 3, value: sails.config.supervisor.url },
            { order: 4, value: customer_name },
            { order: 5, value: 'latest' }
          ]
        }

        // execute integration task
        supervisor.client_customer = autobot.task_customer
        supervisor.create({
          route: autobot.task_exec_path,
          body: payload,
          success: job => res.send(200, job),
          failure: err => res.send(err.statusCode, err)
        })
      }
    )
  }
}
