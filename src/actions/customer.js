import App from 'ampersand-app'
import bootbox from 'bootbox'
import after from 'lodash/after'
import XHR from 'lib/xhr'
import Acls from 'lib/acls'

export default {
  remove (id) {
    var customer = new App.Models.Customer.Model({ id: id })
    customer.destroy({
      success: function(){
        bootbox.alert('Customer Deleted')
        App.state.admin.customers.remove( customer )
      },
      error: function (err) {
        bootbox.alert('Error removing customer')
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

    data.config = {}
    if (data.elasticsearch_enabled) {
      if(!data.elasticsearch_url) {
        bootbox.alert('Please provide an elasticsearch url',function(){})
        return
      }
      data.config.elasticsearch = {
        enabled: true,
        url: data.elasticsearch_url
      }
    } else {
      data.config.elasticsearch = {
        enabled: false,
        url: ''
      }
    }

    if (data.kibana_enabled && !data.kibana_url) {
      bootbox.alert('Please provide a kibana url')
      return
    }
    data.config.kibana = {
      enabled: data.kibana_enabled,
      url: data.kibana_url
    }

    delete data.elasticsearch_enabled
    delete data.elasticsearch_url
    delete data.kibana_enabled
    delete data.kibana_url

    customer.set(data)
    customer.save({}, {
      collection: App.state.admin.customers,
      success: function () {
        bootbox.alert('Customer Updated')
        customer.set({ config: data.config })
        App.state.admin.customers.add(customer, {merge: true})
      },
      error: function (err) {
        bootbox.alert('Error updating customer')
      }
    })
    modal.hide()
  },
  create (data, modal) {
    var customer = new App.Models.Customer.Model({})

    data.config = {}
    if (data.elasticsearch_enabled) {
      if (!data.elasticsearch_url) {
        bootbox.alert('Please provide an elasticsearch url',function(){})
        return
      }
      data.config.elasticsearch = {
        enabled: true,
        url: data.elasticsearch_url
      }
    } else {
      data.config.elasticsearch = {
        enabled: false,
        url: ''
      }
    }

    if (data.kibana_enabled && !data.kibana_url) {
      bootbox.alert('Please provide a kibana url')
      return
    }

    data.config.kibana = {
      enabled: data.kibana_enabled,
      url: data.kibana_url
    }

    delete data.elasticsearch_enabled
    delete data.elasticsearch_url
    delete data.kibana

    customer.set(data)
    customer.save({}, {
      success: function () {
        bootbox.alert('Customer Created')
        App.state.admin.customers.add(customer)
      },
      error: function (err) {
        bootbox.alert('Error creating customer')
      }
    })
    modal.hide()
  },
  getAgentCredentials () {
    if (Acls.hasAccessLevel('admin')) {
      XHR.send({
        url: `${App.config.api_url}/bot/credentials`,
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
