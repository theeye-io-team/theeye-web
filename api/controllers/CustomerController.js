
var CustomerController = module.exports = {
  /**
   *
   *
   */
  index : function(req, res) {
    var supervisor = req.supervisor;
    supervisor.customerFetch({}, function(error, customers) {
      res.view({
        customers: customers ? customers : [],
        errors: error ? req.flash('error') : null
      });
    });
  },
  /**
   * Fetch customers
   * @route GET /admin/customer
   *
   *
   */
  fetch : function(req, res)
  {
    var supervisor = req.supervisor;
    var customerId = req.query.customerId;
    supervisor.customerFetch({}, function(err, customers) {
      if(err) return res.send(500);
      else return res.send(200, { customer: customers });
    });
  },        
  //GET  /admin/customer/:id 
  get : function(req, res)
  {
    var supervisor = req.supervisor;
    var params     = req.params.all();
    var customerId = params.id;

    supervisor.customerGet(customerId, function(err, customer) {
      if(err) return res.send(500);
      else return res.send(200, {customer: customer});
    });
  },        
  //POST  /admin/customer/:id
  create : function(req, res)
  {
    var supervisor = req.supervisor;
    var params = req.params.all();

    if(!params.name) return res.send(400, "Name can't be empty");
    if(!params.email) return res.send(400, "Email can't be empty");

    supervisor.customerCreate(params, function(err, customer) {
      if(err) return res.send(err.statusCode, err);
      else return res.send(200, {customer: customer});
    });
  },
  /**
   * @method PUT  
   * @route /admin/customer/:id
   * @param {String} id
   */
  edit : function(req, res)
  {
    var supervisor = req.supervisor;
    var params = req.params.all();
    var customerId = params.id;

    var toUpdate = {
      description : params.description,
      emails : params.emails
    };

    supervisor.customerReplace(
      customerId, 
      toUpdate, 
      function(err, customer) {
        if(err) return res.send(500, 'server error');
        else return res.json(customer);
      });
  },
  /**
   * @method DELETE
   * @route /admin/customer/:id 
   * @param {String} id
   */
  remove: function(req, res)
  {
    var supervisor = req.supervisor;
    var params = req.params.all();
    var customerId = req.params.id;
    var customerName = req.body.name;

    supervisor.customerRemove(customerId, function(err) {
      if(!err) {

        sails.log.debug('supervisor customer removed');

        User.find({}, function(error, users){
          for(var i=0; i<users.length; i++){
            var user = users[i];
            var idx=user.customers.indexOf(customerName);
            if( idx !== -1 ){
              var removed = user.customers.splice(idx, 1);
              user.save(function(error){
                if(error)
                  sails.log.error('unable to update user "%s" customers', user.username);
              });
            }
          }
        });

        return res.send(204);
      } else return res.send(500);
    });        
  },
  /**
   * @method GET
   * @route /admin/customer/:name/agent
   */
  getUserAgent : function(req, res)
  {
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
