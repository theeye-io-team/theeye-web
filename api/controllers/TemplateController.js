module.exports = {
  index: function(req, res) {
    res.view('spa/index', { layout: 'layout-ampersand' });
  }
}
