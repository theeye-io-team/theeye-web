'use strict';

var stream = require('stream');
var fs = require('fs');

/**
 *
 * File controller
 *
 */
module.exports = {
  /**
   * @method POST
   * @route /api/file
   */
  create (req, res, next) {
    var url = req.originalUrl.replace('/api/',`/${req.session.customer}/`);
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
				method: 'POST',
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
}
