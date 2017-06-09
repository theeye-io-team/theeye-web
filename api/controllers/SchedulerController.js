module.exports = {
  index: function(req, res) {
    res.view('scheduler/index', {layout: 'layout-ampersand'});
    // res.view();
  }
};
