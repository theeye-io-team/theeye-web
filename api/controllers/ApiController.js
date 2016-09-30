/**
 *
 * API Proxy controller
 *
 */
module.exports = {
  /**
   * @method GET
   * @route /api/:customer/:resource
   *
   * @param {String} customer
   * @param {String} resource
   */
  fetch (req, res, next) {
    req.supervisor.fetch({
      query: req.query,
      route: `/${req.params.customer}/${req.params.resource}`,
      failure: (error, apiRes) => res.send(error.statusCode, error),
      success: (body, apiRes) => res.json(body),
    })
  },
  /**
   * @method POST
   * @route /api/:customer/:resource
   *
   * @param {String} customer
   * @param {String} resource
   */
  create (req, res, next){
    req.supervisor.create({
      route: `/${req.params.customer}/${req.params.resource}`,
      body: req.body,
      query: req.query,
      failure: (error, apiRes) => res.send(error.statusCode, error),
      success: (body, apiRes) => res.json(body),
    });
  },
  /**
   * @method PUT
   * @route /api/:customer/:resource/:id
   *
   * @param {String} customer
   * @param {String} resource
   * @param {String} id
   */
  update (req, res, next){
    req.supervisor.update({
      query: req.query,
      route: `/${req.params.customer}/${req.params.resource}/${req.params.id}`,
      body: req.body,
      failure: (error, apiRes) => res.send(error.statusCode, error),
      success: (body, apiRes) => res.json(body),
    });
  },
  /**
   * @method GET
   * @route /api/:customer/:resource/:id
   *
   * @param {String} customer
   * @param {String} resource
   * @param {String} id
   */
  get (req, res, next) {
    req.supervisor.get({
      query: req.query,
      route: `/${req.params.customer}/${req.params.resource}/${req.params.id}`,
      failure: (error, apiRes) => res.send(error.statusCode, error),
      success: (body, apiRes) => res.json(body),
    });
  },
  /**
   * @method DELETE
   * @route /api/:customer/:resource/:id
   *
   * @param {String} customer
   * @param {String} resource
   * @param {String} id
   */
  remove (req, res, next){
    req.supervisor.remove({
      query: req.query,
      route: `/${req.params.customer}/${req.params.resource}/${req.params.id}`,
      failure: (error, apiRes) => res.send(error.statusCode, error),
      success: (body, apiRes) => res.json(body),
    });
  }
}
