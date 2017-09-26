import App from 'ampersand-app'
import bootbox from 'bootbox'
import { Model as Customer } from 'models/customer'
import after from 'lodash/after'

module.exports = {
  remove: function(id){
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
        bootbox.alert('That\'s it, they are gone. Congrats.',() => {
          App.state.loader.visible = false
        })
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
  update: function(id,data, modal){
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

    data.config.kibana = data.kibana

    delete data.elasticsearch_enabled
    delete data.elasticsearch_url
    delete data.kibana

    customer.set(data)
    customer.save({},{
      collection: App.state.customers,
      success: function(){
        bootbox.alert('Customer Updated',function(){ });
        App.state.customers.add(customer, {merge: true})
      },
      error: function(err) {
        bootbox.alert('Error updating customer',function(){ });
      }
    })
    modal.hide()
  },
  create: function(data, modal) {
    var customer = new Customer()

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

    data.config.kibana = data.kibana

    delete data.elasticsearch_enabled
    delete data.elasticsearch_url
    delete data.kibana

    customer.set(data)
    customer.save({},{
      success: function() {
        bootbox.alert('Customer Created',function(){ });
        App.state.customers.add(customer)
      },
      error: function(err) {
        bootbox.alert('Error creating customer',function(){ });
      }
    });
    modal.hide()
  }
}
