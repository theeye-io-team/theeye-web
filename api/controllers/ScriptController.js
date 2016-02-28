var debug = require("debug")("eye:controller:scripts");
var fs = require("fs");
var format = require('util').format;

module.exports = {
  /**
   * Fetch scripts
   * GET /script
   */
  fetch: function(req, res) {
    var supervisor = req.supervisor;
    supervisor.scripts(function(err, scripts) {
      if(err) return res.send(500, err);

      return res.json({ scripts : scripts });
    });
  },
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
  update: function(req, res)
  {
    var params = req.params.all();
    var supervisor = req.supervisor;

    if(!params.id) return res.badRequest('invalid id');
    params.description = params.description || '' ;

    if(params.uploadMehtod === 'fileupload')
    {
      //upload the attached file
      req.file("script").upload({}, function (err, uploadedFiles) {
        if(err) return res.negotiate(err);

        if (uploadedFiles.length === 0) // If no files were uploaded, respond with an error.
          return res.badRequest('No file was uploaded');

        supervisor.patchScript(
          params.id,
          uploadedFiles[0],
          params,
          function(err, response) {
            if(err) return res.send(500, err);
            res.send(200,response);
          });
      });
    }
    else
    {
      //save the source code to a tmp file, then upload it
      var tmpPath = '/tmp/';
      var fileName = format(
        '%s_%s.%s', 
        req.user.id, 
        Date.now(), 
        params.extension
      );
      var source = Buffer(params.scriptSource, 'base64').toString('ascii');

      fs.writeFile(
        tmpPath + fileName,
        source,
        'ascii',
        function(err) {
          var scriptFile = {
            fd: tmpPath + fileName,
            filename: fileName
          };
          supervisor.patchScript(
            params.id,
            scriptFile,
            params,
            function(err, response) {
              if(err) return res.send(500, err);
              res.send(200,response);
            });
        }
      );
    }
  },
  /**
   * Delete script
   * DEL /script/:id
   */
  destroy: function(req, res)
  {
    var id = req.param("id", null);
    var supervisor = req.supervisor;

    if( ! id || ! id.match(/^[a-fA-F0-9]{24}$/) )
      return res.send(400,'invalid id');
    else {
      supervisor.deleteScript( id, function(err) {
        if(err) return res.send(500, err);
        res.send(200, "Script %s deleted".replace('%s',id));
      }
      );
    }
  },
  /**
   * Create script
   * POST /script
   */  
  create: function(req, res)
  {
    var params = req.params.all();
    var supervisor = req.supervisor;

    if(params.uploadMehtod === 'fileupload') {
      //upload the attached file
      req.file("script").upload({}, function (err, uploadedFiles) {
        if(err) return res.negotiate(err);
        
        // If no files were uploaded, respond with an error.
        if (uploadedFiles.length === 0)
          return res.badRequest('No file was uploaded');

        supervisor.createScript(
          uploadedFiles[0], 
          params, 
          function(err, response) {
            if(err) return res.send(500, err);
            res.send(200, response);
          });
      });
    }
    else
    {
      //save the source code to a tmp file, then upload it
      var tmpPath  = '/tmp/';
      var fileName = req.user.id + '_' + Date.now() + '.' + params.extension;
      var source   = Buffer(params.scriptSource, 'base64').toString('ascii');
      
      fs.writeFile(
        tmpPath + fileName, 
        source, 
        'utf-8',
        function(err){
          var scriptFile = {
            fd: tmpPath+fileName,
            filename: fileName
          };

          supervisor.createScript(
            scriptFile,
            params,
            function(err, response) {
              if(err) return res.send(500, err);
              res.send(200, response);
            });
        }
      );
    }  
  },
  /**
   * Action blueprints:
   *    `/script/index`
   *    `/script`
   */
  index: function(req, res) {
    var supervisor = req.supervisor;

    supervisor.scripts( function(err, scripts) {
      if (err) {
        debug(err);
        return res.serverError("Error getting data from supervisor: " + err);
      }

      return res.view({
        'scripts': scripts
      })
    });
  },
  /**
  * Overrides for the settings in `config/controllers.js`
  * (specific to ScriptController)
  */
  _config: {}
};
