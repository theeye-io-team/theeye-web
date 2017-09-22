
module.exports = (req, res, next) => {
  if (!req.isSocket) {
    res.cookie(
      'theeye', JSON.stringify({
        customer: req.user.current_customer,
        base_url: sails.config.application.baseUrl + '/api',
        supervisor_url: sails.config.supervisor.url,
        user: req.user.id
      })
    )
  }
  return next()
}
