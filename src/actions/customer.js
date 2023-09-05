import App from 'ampersand-app'
import bootbox from 'bootbox'
import after from 'lodash/after'
import XHR from 'lib/xhr'
import Acls from 'lib/acls'

export default {
  remove (id) {
    const customer = new App.Models.Customer.Model({ id: id })
    customer.destroy({
      success: function(){
        App.state.alerts.success(`Customer removed`)
        App.state.admin.customers.remove( customer )
      },
      error: function (err) {
        App.state.alerts.danger(`Failed to remove customer ${customer.view_name}`)
      }
    });
  },
  massiveDelete (customers) {
    App.state.loader.visible = true

    var errors = 0
    const done = after(customers.length,()=>{
      if (errors > 0) {
        const count = (errors===customers.length) ? 'all' : 'some of'
        bootbox.alert(
          `Well, ${count} the delete request came back with error. Reloding now...`,() => {
            window.location.reload()
          }
        )
      } else {
        App.state.loader.visible = false
        bootbox.alert('That\'s it, they are gone. Congrats.',() => { })
      }
    })

    customers.forEach(function(customer){
      customer.destroy({
        success () {
          App.state.admin.customers.remove(customer)
          done()
        },
        error () {
          errors++
          done()
        }
      })
    })
  },
  update (id,data, modal) {
    var customer = new App.Models.Customer.Model({ id: id })

    customer.set(data)
    customer.save({}, {
      collection: App.state.admin.customers,
      success: function () {
        bootbox.alert('Customer Updated')
        App.state.admin.customers.add(customer, {merge: true})
      },
      error: function (err) {
        bootbox.alert('Error updating customer')
      }
    })
    modal.hide()
  },
  create (data, modal) {
    const customer = new App.Models.Customer.Model({})

    customer.set(data)
    customer.save({}, {
      success: function () {
        App.state.alerts.success(`Customer ${customer.view_name} created`)
        App.state.admin.customers.add(customer)
      },
      error: function (model, resp) {
        App.state.alerts.danger(`Failed to create customer`, resp.body?.message)
      }
    })
  },
  getAgentCredentials () {
    if (Acls.hasAccessLevel('admin')) {
      XHR.send({
        url: `${App.config.api_url}/bot/installer`,
        method: 'get',
        done: (response, xhr) => {
          if (xhr.status !== 200) {
            bootbox.alert({
              title: 'Error',
              message: 'Error fetching bot credentials, please try again later.'
            })
          } else {
            App.state.settingsMenu.customer.agent = response
          }
        },
        fail: (err,xhr) => {
          bootbox.alert({
            title: 'Error',
            message: 'Error fetching bot credentials, please try again later.'
          })
        }
      })
    }
  }
}
