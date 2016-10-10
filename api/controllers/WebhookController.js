/**
 * only return the initial call to js render and the layout
 * @author facugon
 */
module.exports = {
  index: function(req, res) {
    res.view();
  }
}
