/**
 * 404 (Not Found) Handler
 *
 * Usage:
 * return res.notFound();
 * 
 * NOTE:
 * If no user-defined route, blueprint route, or static file matches
 * the requested URL, Sails will call `res.notFound()`.
 */
module.exports = function notFound() {

  // Get access to `req`, `res`, `sails`
  var req = this.req;
  var res = this.res;
  var sails = req._sails;

  res.redirect('/')
}
