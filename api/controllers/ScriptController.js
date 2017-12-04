var debug = require("debug")("eye:controller:scripts");
var fs = require('fs');
var format = require('util').format;
var stream = require('stream');

module.exports = {
  /**
   * Get script
   * GET /script/:id
   */
  get: function(req, res)
  {
    var id = req.param("id", null);
    var supervisor = req.supervisor;

    supervisor.script( id, function(err, script) {
      supervisor.scriptDownload(id, function(err, scriptFile) {
        return res.json({
          script : script,
          file : scriptFile
        });
      });
    });
  },
  /**
   * Get script
   * GET /admin/script/download
   */
  downloadPublicScript: function(req, res)
  {
    var url = req.param("url", null);

    debug(url);

    var request = require("request");
    request(url, {}, function(error, response, body) {
      if(error) return res.send(500, error);
      else return res.json(body);
    });
  },
  /**
   * Edit script
   * PUT /script/:id
   */
  update: function(req, res) {
    var params = req.params.all();
    var supervisor = req.supervisor;

    if(!params.id) return res.badRequest('invalid id');
    params.description = params.description || '' ;


    var str = new Buffer(params.script, 'base64').toString('ascii') ;
    var source = decodeURIComponent(escape(str));

    var fname = '/tmp/' + req.user.id + '_' + Date.now();
    fs.writeFile(fname,source,'ascii',err => {
      supervisor.patchScript(
        params.id,
        fs.createReadStream(fname),
        params,
        function(err, response) {
          if(err) return res.send(500, err);
          res.send(200,response);
        });
    });

  },
  /**
   * Create script
   * POST /script
   */
  create: function(req, res)
  {
    var params = req.params.all();
    var supervisor = req.supervisor;

    var str = new Buffer(params.script,'base64').toString('ascii') ;
    var source = decodeURIComponent(escape(str));

    var fname = '/tmp/' + req.user.id + '_' + Date.now();
    fs.writeFile(fname,source,'ascii',err => {
      supervisor.createScript(
        fs.createReadStream(fname),
        params,
        function(err, response) {
          if(err) return res.send(500, err);
          res.send(200, response);
        }
      );
    });
  },
  _config: {}
};
