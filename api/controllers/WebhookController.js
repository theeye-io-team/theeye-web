module.exports = {
  index: function(req, res) {
    return res.view('webhook/index',{
      layout:'layout-ampersand'
    });
  }
}
