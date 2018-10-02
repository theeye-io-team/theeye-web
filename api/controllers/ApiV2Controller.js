/* global sails */
'use strict';

const apibase = '/apiv2/'
const fs = require('fs')

const logger = require('../libs/logger')('controllers:apiv2')

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
    logger.debug('fetch api url ' + req.originalUrl);
    var route = req.originalUrl.replace(apibase,`/${req.user.current_customer}/`);
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
    logger.debug('post api url ' + req.originalUrl);
    var route = req.originalUrl.replace(apibase,`/${req.user.current_customer}/`);
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
    logger.debug('put api url ' + req.originalUrl);
    var route = req.originalUrl.replace(apibase,`/${req.user.current_customer}/`);
    req.supervisor.update({
      route: route,
      query: req.query,
      body: req.body,
      failure: (error, apiRes) => {
        logger.error('%o',error);
        res.send(error.statusCode, error)
      },
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
    logger.debug('patch api url ' + req.originalUrl);
    var route = req.originalUrl.replace(apibase,`/${req.user.current_customer}/`);
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
    logger.debug('get api url ' + req.originalUrl);
    var route = req.originalUrl.replace(apibase,`/${req.user.current_customer}/`);
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
    logger.debug('remove api url ' + req.originalUrl);
    var route = req.originalUrl.replace(apibase,`/${req.user.current_customer}/`);
    req.supervisor.remove({
      route: route,
      query: req.query,
      failure: (error, apiRes) => res.send(error.statusCode, error),
      success: (body, apiRes) => res.json(body),
    });
  },
  /**
   * @method POST||PUT
   * @route /apiv2/file
   */
  filePut (req, res, next) {
    const url = req.originalUrl.replace(apibase, `/${req.user.current_customer}/`)
    var params = req.params.all()
    let source = Buffer.from(params.data, 'base64').toString('utf8')

    var fname = ['/tmp/', req.user.id, '_', Date.now()].join('')

    fs.writeFile(fname, source, 'utf8', err => {
      if (err) { return res.send(500, err) }

      params.public = 0
      params.file = {
        value: fs.createReadStream(fname),
        options: {
          filename: params.filename
        }
      }

      for (let idx in Object.assign({}, params)) {
        let param = params[idx]
        if (!param) { delete params[idx] }
      }

      req.supervisor.performRequest({
        method: req.method, // POST or PUT
        url: url,
        formData: params
      }, function (error, body) {
        if (error) {
          logger.error('%o',error)
          res.send(error.statusCode || 500, error)
        } else {
          res.send(200, body)
        }
      })
    })
  },
  /**
   * @method GET
   * @route /apiv2/file
   */
  fileGet (req, res, next) {
    var url = req.originalUrl.replace(apibase, `/${req.user.current_customer}/`);
    var supervisor = req.supervisor;

    supervisor.performRequest({
      method: 'GET',
      url: url
    }, function (error, file) {
      supervisor.performRequest({
        json: false,
        method: 'GET',
        url: url + '/download'
      }, function (error, body) {
        if (error) { return res.send(500, error) }

        file.data = Buffer.from(body).toString('base64')
        res.send(200, file);
      });
    });
  },
  /**
   * @method {POST}
   * @route /apiv2/task/schedule
   * NOTE: since the schedule endpoint is a custom
   * one (it handles the agenda/job scheme and relates the
   * job with the task_id) this api proxy is needed
   */
  createSchedule (req, res, next) {
    // var route = req.originalUrl.replace(apibase, `/${req.user.current_customer}/`)
    // sorry for the custom route =) -- cg
    var route = `/${req.user.current_customer}/task/${req.body.task}/schedule`
    logger.debug('post api url ' + route)

    req.supervisor.create({
      route: route,
      body: req.body,
      query: req.query,
      failure: (error, apiRes) => res.send(error.statusCode, error),
      success: (body, apiRes) => res.json(body)
    })
  },
  // GET
  getSchedules: function (req, res, next) {
    var supervisor = req.supervisor
    var id = req.param('id', null)
    if (!id || !id.match(/^[a-fA-F0-9]{24}$/)) {
      return res.send(400, 'invalid id')
    } else {
      supervisor.getTaskSchedule(id, function (err, scheduleData) {
        if (err) {
          return res.send(500, err)
        }
        res.json(scheduleData)
      })
    }
  },
  // DELETE
  cancelSchedule: function (req, res) {
    var supervisor = req.supervisor
    var taskId = req.param('id', null)
    var scheduleId = req.param('scheduleId', null)

    if (!taskId || !taskId.match(/^[a-fA-F0-9]{24}$/)) {
      return res.send(400, 'invalid id')
    } else if (!scheduleId || !scheduleId.match(/^[a-fA-F0-9]{24}$/)) {
      return res.send(400, 'invalid schedule id')
    } else {
      supervisor.remove({
        route: '/:customer/task',
        id: taskId,
        child: 'schedule/' + scheduleId,
        failure: error => res.send(500, error),
        success: task => res.json(task)
      })
    }
  }
}
