var debug = require('debug')('eye:web:controller:user');

var ProcessController = module.exports = {

  updatetheeyepassports : function(req, res, next)
  {
    if(req.user.credential != 'root') return res.send(403);

    passport.createmissingtheeyepassports(req, res, next);

    res.send(202);
  }

}
