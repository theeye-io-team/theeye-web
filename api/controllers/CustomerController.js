
var CustomerController = module.exports = {
  /**
   * @route GET /admin/customer
   */
  index (req, res) {
    var supervisor = req.supervisor;
    supervisor.fetch({
      route:'/customer',
      success: customers => {
        res.view({ customers: customers, errors: null });
      },
      failure: err => {
        sails.log.error(err);
        res.view({ customers: [], errors: err });
      }
    });
  },
  /**
   * @route GET /admin/customer
   */
  fetch (req, res) {
    var supervisor = req.supervisor;
    supervisor.fetch({
      route:'/customer',
      success: customers => {
        res.send(200, { customer: customers });
      },
      failure: err => {
        sails.log.error(err);
        res.send(err.statusCode,err);
      }
    });
  },
  /**
   *
   * GET  /admin/customer/:id 
   *
   */
  get (req, res) {
    req.supervisor.get({
      route:'/customer',
      id:req.params.id,
      success: customer => res.send(200, {customer: customer}),
      failure: err => res.send(err.statusCode, err)
    });
  },        
  //POST  /admin/customer/:id
  create (req, res) {
    var params = req.params.all();

    if(!params.name) return res.send(400, "Name can't be empty");
    if(!params.email) return res.send(400, "Email can't be empty");

    req.supervisor.create({
      route:'/customer',
      body: params,
      success: customer => res.send(200, customer),
      failure: err => res.send(err.statusCode, err)
    });
  },
  /**
   * @method PUT  
   * @route /admin/customer/:id
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
   * @method DELETE
   * @route /admin/customer/:id 
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
                if(error) sails.log.error('unable to update user "%s" customers', user.username);
              });
            }
          }
        });

        return res.send(204);
      },
      failure: err => {
        sails.log.error(err);
        return res.json(err.statusCode, err);
      }
    });
  },
  /**
   * @method GET
   * @route /admin/customer/:name/agent
   */
  getUserAgent (req, res) {
    var supervisor = req.supervisor;
    var customer_name = req.params.name;

    var theeye = passport.protocols.theeye;
    theeye.getCustomerAgentCredentials(
      customer_name,
      supervisor,
      function(err, user){
        if(err) return res.send(500);
        if(!user) return res.send(404);
        return res.send(200, { user: user });
      }
    );
  }    
};
