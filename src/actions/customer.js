import App from 'ampersand-app'
import bootbox from 'bootbox'
import { Model as Customer } from 'models/customer'
import after from 'lodash/after'
const config = require('config')
import XHR from 'lib/xhr'

module.exports = {
  remove (id) {
    var customer = new Customer({ id: id })
    customer.destroy({
      success: function(){
        bootbox.alert('Customer Deleted',function(){ })
        App.state.customers.remove( customer )
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
          App.state.customers.remove(customer)
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
    var customer = new Customer({ id: id })

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
    delete data.kibana

    customer.set(data)
    customer.save({}, {
      collection: App.state.customers,
      success: function () {
        bootbox.alert('Customer Updated')
        App.state.customers.add(customer, {merge: true})
      },
      error: function (err) {
        bootbox.alert('Error updating customer')
      }
    })
    modal.hide()
  },
  create (data, modal) {
    var customer = new Customer()

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
        App.state.customers.add(customer)
      },
      error: function (err) {
        bootbox.alert('Error creating customer')
      }
    })
    modal.hide()
  },
  getAgentCredentials () {
    XHR.send({
      url: `${config.app_url}/customer/agent`,
      method: 'get',
      done: (response,xhr) => {
        if (xhr.status !== 200) {
          bootbox.alert({
            title: 'Error',
            message: 'Error fetching bot credentials, please try again later.'
          })
        } else {
          App.state.navbar.settingsMenu.agent = response.user
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
