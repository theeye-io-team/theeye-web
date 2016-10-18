/**
 * only return the initial call to js render and the layout
 */
module.exports = {
  index: function(req, res) {
    res.view();
  }
}
