
module.exports = {
  /**
   *
   * bearer authentication access control
   *
   */
  refreshAccessToken (req, res) {
    const user = req.user
    const accessToken = jwtoken.issue({ user_id: user.id })
    return res.send(200, {
      access_token: accessToken
    })
  },
  // Set the navigation customer for the current user
  currentCustomer (req, res) {
    const customer = req.params.customer
    const user = req.user

    if (user.customers.indexOf(customer) !== -1) {
      user.current_customer = customer
      user.save(err => {
        if (err) {
          return res.status(500).json('Internal Error')
        }
        res.send(200,{})
      })
    } else {
      res.send(403,'Forbidden')
    }
  },
  sessionProfile (req, res) {
    const user = req.user

    Passport.findOne({
      user: user.id,
      protocol: 'theeye'
    }, (err, theeye) => {
      if (err) return res.send(500,err)

      user.theeye = theeye
      const customers = theeye.profile.customers
      const current_customer = customers.find(c => c.name==user.current_customer)

      req.supervisor.get({
        route: `${current_customer.name}/customer`,
        success: customer => {
          user.current_customer = customer
          res.send(200, user)
        },
        failure: err => {
          console.error(err)
          res.send(500,'error fetching profile')
        }
      })
      //return res.json(user)
    })
  },
  updateSettings (req, res) {
    const user = req.user
    const params = req.params.all()

    const settings = { notifications: params.notifications }

    User
      .update({ id: user.id }, settings)
      .exec((err, updated) => {
        if (err) {
          sails.log.error(err)
          return res.send(500, 'internal server error')
        }

        if (updated.length === 0) {
          return res.send(404, 'user not found')
        }

        res.send(200, updated)
      })
  }
}
