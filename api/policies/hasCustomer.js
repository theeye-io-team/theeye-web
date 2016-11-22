
module.exports = function hasCustomer (req, res, next)
{  
  sails.log.debug("hasCustomer policy for the current customer %s", req.session.customer);

  if(!req.user) return next();

  if(req.user.customers.length === 0) {
    sails.log.error("the current user has no customer");
    return res.forbidden('You are not permitted to perform this action.');
  }

  function validCustomer () {
    res.cookie(
      'theeye', JSON.stringify({
        customer: req.session.customer,
        base_url: sails.config.application.baseUrl + '/api',
        supervisor_url: sails.config.supervisor.url,
        credential: req.user.credential
      })
    );

    return next();
  }

  if(req.session.customer) {
    var usrCustomers = req.user.customers;
    if( usrCustomers.indexOf( req.session.customer ) != -1 ) {
      return validCustomer();
    } else {
      sails.log.error("the current user dont have the rights for the customer %s", req.session.customer);
      return res.forbidden('You are not permitted to perform this action.');
    }
  }
  else
  {
    sails.log.info("no active customer, setting the firts from the list");
    req.session.customer = req.user.customers[0];
    return validCustomer();
  }
};
