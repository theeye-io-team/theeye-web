/**
 * returns spa/index with app router
 * @author facugon
 */
module.exports = {
  index: function(req, res) {
    return res.view('spa/index',{ layout:'layout-ampersand' });
  }
}
