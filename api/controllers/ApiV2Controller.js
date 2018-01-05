/* global sails */
'use strict';

const apibase = '/apiv2/'
const fs = require('fs')

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
    sails.log.debug('post api url ' + req.originalUrl);
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
    sails.log.debug('put api url ' + req.originalUrl);
    var route = req.originalUrl.replace(apibase,`/${req.user.current_customer}/`);
    req.supervisor.update({
      route: route,
      query: req.query,
      body: req.body,
      failure: (error, apiRes) => {
        sails.log.debug(error);
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
    sails.log.debug('patch api url ' + req.originalUrl);
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
    sails.log.debug('get api url ' + req.originalUrl);
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
    sails.log.debug('remove api url ' + req.originalUrl);
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
    var url = req.originalUrl.replace(apibase,`/${req.user.current_customer}/`);
    var params = req.params.all();
    var buffer = new Buffer(params.data, 'base64');
    var source = decodeURIComponent(escape(buffer.toString('ascii')));
    var fname = '/tmp/' + req.user.id + '_' + Date.now();

    fs.writeFile(fname, source, 'ascii', err => {
      if (err) {
        return res.send(500, err)
      }
      // https://github.com/request/request/issues/1761
      // formData bug? if true/false value is passed into
      // formData object, request throws:
      // TypeError: first argument must be a string or Buffer
      params.public = 0 // fuck this shit!!!!!!!!!!!!!!!!!!!!
      var readstream = fs.createReadStream(fname)
      params.file = {
        value: readstream,
        options: {
          filename: params.filename
        }
      }
      req.supervisor.performRequest({
        method: req.method, // POST or PUT
        url: url,
        formData: params
      }, function (error, body) {
        if (error) {
          sails.log.error(error)
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
    var url = req.originalUrl.replace(apibase,`/${req.user.current_customer}/`);
    var supervisor = req.supervisor;

    supervisor.performRequest({
      method: 'GET',
      url: url
    }, function(error,file){
      supervisor.performRequest({
        json: false,
        method: 'GET',
        url: url + '/download'
      },function(error, body){
        if (error) return res.send(500,error);
        var source = unescape(encodeURIComponent(body));
        file.data = new Buffer(source).toString('base64');
        res.send(200,file);
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
    sails.log.debug('post api url ' + route)

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
