import App from 'ampersand-app'
import bootbox from 'bootbox'
import { Model as Webhook } from 'models/webhook'
import after from 'lodash/after'

module.exports = {
  remove: function(id){
    var webhook = new Webhook({ id: id })
    webhook.destroy({
      success: function(){
        bootbox.alert('Webhook Deleted',function(){ })
        App.state.webhooks.remove( webhook )
      }
    });
  },
  massiveDelete (webhooks) {
    App.state.loader.visible = true

    var errors = 0
    const done = after(webhooks.length,()=>{
      if (errors > 0) {
        const count = (errors===webhooks.length) ? 'all' : 'some of'
        bootbox.alert(
          `Well, ${count} the delete request came back with error. Reloding now...`,() => {
            //window.location.reload()
            App.Router.reload()
          }
        )
      } else {
        bootbox.alert('That\'s it, they are gone. Congrats.',() => {
          App.state.loader.visible = false
        })
      }
    })

    webhooks.forEach(function(webhook){
      webhook.destroy({
        success () {
          App.state.webhooks.remove(webhook)
          done()
        },
        error () {
          errors++
          done()
        }
      })
    })
  },
  update: function(id,data){
    //const webhook = App.state.webhooks.get(id)
    //if (!webhook){ return }

    var webhook = new Webhook({ id: id })
    webhook.set(data)
    webhook.save({},{
      collection: App.state.webhooks,
      success: function(){
        bootbox.alert('Webhook Updated',function(){ });
        App.state.webhooks.add(webhook, {merge: true})
      }
    })
  },
  create: function(data){
    var webhook = new Webhook()
    webhook.set(data)
    webhook.save({},{
      success: function(){
        bootbox.alert('Webhook Created',function(){ });
        App.state.webhooks.add(webhook)
      }
    });
  },
  trigger: function(webhook){
    $.ajax({
      method: 'POST',
      url: webhook.triggerUrl,
      dataType: 'json'
    }).done(function(data){
      bootbox.alert('Webhook triggered');
    }).fail(function(xhr,status){
      bootbox.alert('Webhook trigger error');
    });
  }
}
