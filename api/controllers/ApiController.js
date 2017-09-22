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
    var route = req.originalUrl.replace('/api/',`/${req.user.current_customer}/`);
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
    var route = req.originalUrl.replace('/api/',`/${req.user.current_customer}/`);
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
    var route = req.originalUrl.replace('/api/',`/${req.user.current_customer}/`);
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
    var route = req.originalUrl.replace('/api/',`/${req.user.current_customer}/`);
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
    var route = req.originalUrl.replace('/api/',`/${req.user.current_customer}/`);
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
    var route = req.originalUrl.replace('/api/',`/${req.user.current_customer}/`);
    req.supervisor.remove({
      route: route,
      query: req.query,
      failure: (error, apiRes) => res.send(error.statusCode, error),
      success: (body, apiRes) => res.json(body),
    });
  },
  /**
   * @method {POST||PUT}
   * @route /api/file
   */
  upload (req, res, next) {
    var url = req.originalUrl.replace('/api/',`/${req.user.current_customer}/`);
    var params = req.params.all();
    var buffer = new Buffer(params.file,'base64');
    var source = decodeURIComponent(escape(buffer.toString('ascii')));
    var fname = '/tmp/' + req.user.id + '_' + Date.now();

		fs.writeFile(fname,source,'ascii',err => {
			var readstream = fs.createReadStream(fname);
			params.file = {
				value: readstream,
				options: {
					filename: params.filename
				}
			};

			req.supervisor.performRequest({
				method: req.method, // POST or PUT
				url: url,
				formData: params
			}, function(error, body) {
				if (error) {
					sails.log.error(error);
					res.send(error.statusCode||500, error);
				} else {
					res.send(200,body);
				}
			});
		});
  },
  download (req, res, next) {
    var url = req.originalUrl.replace('/api/',`/${req.user.current_customer}/`);
    var supervisor = req.supervisor;

    supervisor.performRequest({
      method: 'GET',
      url: url
    },function(error,file){
      supervisor.performRequest({
        json: false,
        method: 'GET',
        url: url + '/download'
      },function(error, body){
        if (error) return res.send(500,error);
        var source = unescape(encodeURIComponent(body));
        file.file = new Buffer(source).toString('base64');
        res.send(200,file);
      });
    });
  }
}
