/**
 *
 * API Proxy controller
 *
 */
module.exports = {
  /**
   * @method GET
   * @route /api/:resource
   *
   * @param {String} resource
   */
  fetch (req, res, next) {
    req.supervisor.fetch({
      query: req.query,
      route: `/${req.session.customer}/${req.params.resource}`,
      failure: (error, apiRes) => res.send(error.statusCode, error),
      success: (body, apiRes) => res.json(body),
    })
  },
  /**
   * @method POST
   * @route /api/:resource
   *
   * @param {String} resource
   */
  create (req, res, next){
    req.supervisor.create({
      route: `/${req.session.customer}/${req.params.resource}`,
      body: req.body,
      query: req.query,
      failure: (error, apiRes) => res.send(error.statusCode, error),
      success: (body, apiRes) => res.json(body),
    });
  },
  /**
   * @method PUT
   * @route /api/:resource/:id
   *
   * @param {String} resource
   * @param {String} id
   */
  update (req, res, next){
    req.supervisor.update({
      query: req.query,
      route: `/${req.session.customer}/${req.params.resource}`,
      id: req.params.id,
      body: req.body,
      failure: (error, apiRes) => res.send(error.statusCode, error),
      success: (body, apiRes) => res.json(body),
    });
  },
  /**
   * @method GET
   * @route /api/:resource/:id
   *
   * @param {String} resource
   * @param {String} id
   */
  get (req, res, next) {
    req.supervisor.get({
      query: req.query,
      route: `/${req.session.customer}/${req.params.resource}`,
      id: req.params.id,
      failure: (error, apiRes) => res.send(error.statusCode, error),
      success: (body, apiRes) => res.json(body),
    });
  },
  /**
   * @method DELETE
   * @route /api/:resource/:id
   *
   * @param {String} resource
   * @param {String} id
   */
  remove (req, res, next){
    req.supervisor.remove({
      query: req.query,
      route: `/${req.session.customer}/${req.params.resource}`,
      id: req.params.id,
      failure: (error, apiRes) => res.send(error.statusCode, error),
      success: (body, apiRes) => res.json(body),
    });
  }
}
