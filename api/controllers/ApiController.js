'use strict';

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
    sails.log.debug('fetch api url ' + req.originalUrl);
    var route = req.originalUrl.replace('/api/',`/${req.session.customer}/`);
    req.supervisor.fetch({
      route: route,
      query: req.query,
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
    sails.log.debug('post api url ' + req.originalUrl);
    var route = req.originalUrl.replace('/api/',`/${req.session.customer}/`);
    req.supervisor.create({
      route: route,
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
    sails.log.debug('put api url ' + req.originalUrl);
    var route = req.originalUrl.replace('/api/',`/${req.session.customer}/`);
    req.supervisor.update({
      route: route,
      query: req.query,
      body: req.body,
      failure: (error, apiRes) => res.send(error.statusCode, error),
      success: (body, apiRes) => res.json(body),
    });
  },
  /**
   * @method PATCH
   * @route /api/:resource/:id
   *
   * @param {String} resource
   * @param {String} id
   */
  patch (req, res, next) {
    sails.log.debug('patch api url ' + req.originalUrl);
    var route = req.originalUrl.replace('/api/',`/${req.session.customer}/`);
    req.supervisor.patch({
      route: route,
      query: req.query,
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
    sails.log.debug('get api url ' + req.originalUrl);
    var route = req.originalUrl.replace('/api/',`/${req.session.customer}/`);
    req.supervisor.get({
      route: route,
      query: req.query,
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
    sails.log.debug('remove api url ' + req.originalUrl);
    var route = req.originalUrl.replace('/api/',`/${req.session.customer}/`);
    req.supervisor.remove({
      route: route,
      query: req.query,
      failure: (error, apiRes) => res.send(error.statusCode, error),
      success: (body, apiRes) => res.json(body),
    });
  }
}
