
module.exports = {
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
}
