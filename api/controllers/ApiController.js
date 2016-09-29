/**
 *
 * API Proxy controller
 *
 */
module.exports = {
  /**
   * @method GET
   * @route /api/:customer/:resource
   *
   * @param {String} customer
   * @param {String} resource
   */
  fetch (req, res, next) {
    var supervisor = req.supervisor;
    var customer = params.customer,
      resource = params.resource;
    var params = req.params.all();
  },
  /**
   * @method POST
   * @route /api/:customer/:resource
   *
   * @param {String} customer
   * @param {String} resource
   */
  create (req, res, next){
    var supervisor = req.supervisor;
    var customer = params.customer,
      resource = params.resource;
    var params = req.body;
  },
  /**
   * @method PUT
   * @route /api/:customer/:resource/:id
   *
   * @param {String} customer
   * @param {String} resource
   * @param {String} id
   */
  update (req, res, next){
    var supervisor = req.supervisor;
    var id = params.id,
      customer = params.customer,
      resource = params.resource;
    var params = req.body;
  },
  /**
   * @method GET
   * @route /api/:customer/:resource/:id
   *
   * @param {String} customer
   * @param {String} resource
   * @param {String} id
   */
  get (req, res, next) {
    var supervisor = req.supervisor;
    var id = params.id,
      customer = params.customer,
      resource = params.resource;
  },
  /**
   * @method DELETE
   * @route /api/:customer/:resource/:id
   *
   * @param {String} customer
   * @param {String} resource
   * @param {String} id
   */
  remove (req, res, next){
    var supervisor = req.supervisor;
    var id = params.id,
      customer = params.customer,
      resource = params.resource;
  }
}
