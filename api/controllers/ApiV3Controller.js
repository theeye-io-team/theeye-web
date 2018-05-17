/* global sails */
'use strict'

const apibase = '/apiv3/'
const logger = require('../libs/logger')('controllers:apiv3')

/**
 *
 * API Proxy controller
 *
 */
module.exports = {
  /**
   * @method GET
   * @route /apiv3/:route*
   *
   * @param {String} resource
   * @param {String} id
   */
  get (req, res, next) {
    logger.debug('getting api url ' + req.originalUrl)
    var route = req.originalUrl.replace(apibase,'')
    req.supervisor.get({
      route: route,
      query: req.query,
      failure: (error, apiRes) => res.send(error.statusCode, error),
      success: (body, apiRes) => res.json(body),
    })
  },
  /**
   * @method GET
   * @route /apiv3/:route*
   *
   * @param {String} resource
   */
  fetch (req, res, next) {
    logger.debug('fetching api url ' + req.originalUrl)
    var route = req.originalUrl.replace(apibase,'')
    req.supervisor.fetch({
      route: route,
      query: req.query,
      failure: (error, apiRes) => res.send(error.statusCode, error),
      success: (body, apiRes) => res.json(body)
    })
  },
  /**
   * @method PATCH
   * @route /apiv3/:route
   *
   * @param {String} resource
   * @param {String} id
   */
  patch (req, res, next) {
    logger.debug('patching api url ' + req.originalUrl);
    var route = req.originalUrl.replace(apibase,'')
    req.supervisor.patch({
      route: route,
      query: req.query,
      body: req.body,
      failure: (error, apiRes) => res.send(error.statusCode, error),
      success: (body, apiRes) => res.json(body),
    });
  },
  /**
   * @method PUT
   * @route /apiv3/:route
   *
   * @param {String} resource
   * @param {String} id
   */
  update (req, res, next) {
    logger.debug('putting api url ' + req.originalUrl);
    var route = req.originalUrl.replace(apibase,'')
    req.supervisor.update({
      route: route,
      query: req.query,
      body: req.body,
      failure: (error, apiRes) => res.send(error.statusCode, error),
      success: (body, apiRes) => res.json(body),
    });
  },
  /**
   * @method DELETE
   * @route /apiv3/:route
   *
   * @param {String} resource
   * @param {String} id
   */
  remove (req, res, next){
    logger.debug('remove api url ' + req.originalUrl)
    var route = req.originalUrl.replace(apibase,'')
    req.supervisor.remove({
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
    logger.debug('post api url ' + req.originalUrl);
    var route = req.originalUrl.replace(apibase,'')
    req.supervisor.create({
      route: route,
      body: req.body,
      query: req.query,
      failure: (error, apiRes) => res.send(error.statusCode, error),
      success: (body, apiRes) => res.json(body),
    });
  },
  // GET
  getFileLinkedModels (req, res) {
    const supervisor = req.supervisor
    const file_id = req.param('id')
    if (!file_id) return res.send(400, 'File id required.')

    var route = req.originalUrl.replace(apibase,'')

    supervisor.fetch({
      route: `/file/${file_id}/linkedmodels`,
      method: 'GET',
      failure: (error, apires) => res.send(error.statusCode, error) ,
      success: (body, apires) => res.json(body)
    })
  },
}
