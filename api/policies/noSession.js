/**
 * noSession
 *
 * @module      :: Policy
 * @description :: Set the `req.session = null` to avoid sns push notifications session entry on mongo.
 *
 */
module.exports = function(req, res, next)
{
    req.session = null;
	return next();
};
