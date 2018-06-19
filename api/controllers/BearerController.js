var fetch = require('isomorphic-fetch')
const Notifications = require('../libs/notifications')

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

        Notifications.sockets.send({
          topic: 'session-customer-changed',
          data: {
            model: user,
            model_type: 'User',
            operation: 'update',
            organization: user.current_customer // customer name
          }
        })

        res.send(200, {})
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

      if (
        ! customers ||
        ! Array.isArray(customers) ||
        customers.length === 0
      ) {
        return res.send(500, 'error fetching profile. profile customers are empty.')
      }

      const current_customer = customers.find(c => c.name==user.current_customer)

      if (!current_customer) {
        return res.send(500,'error fetching profile. profile customer not found.')
      }

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

    user.notifications = params.notifications
    user.save(err => {
      if (err) {
        sails.log.error(err)
        return res.send(500, 'internal server error')
      }

      res.send(200, { notifications: user.notifications })
    })
  },
  updateOnboarding (req, res) {
    const user = req.user
    const params = req.params.all()

    user.onboardingCompleted = params.onboardingCompleted

    user.save(err => {
      if (err) {
        sails.log.error(err)
        return res.send(500, 'internal server error')
      }

      res.send(200, { onboardingCompleted: user.onboardingCompleted })
    })
  },
  licenseCheck (req, res) {
    const { client_customer } = req.supervisor
    const licenseServiceUri = 'https://65oomigadl.execute-api.us-east-1.amazonaws.com/dev-license'
    const url = `${licenseServiceUri}?client=${client_customer}`

    const fetchOptions = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    }
    fetch(url, fetchOptions)
      .then(response => response.json())
      .then(json => {
        const expired = (json && json.endLicense)
          ? new Date() > new Date(json.endLicense)
          : false
        return res.send(200, { expired })
      })
      .catch(err => res.send(500, err))
  }
}
