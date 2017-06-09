'use strict'

var MonitorActions = {
  create: function(data){
    var scraper = new App.Models.Monitor(data);
    scraper.save({},{
      success:function(model, response, options){
        bootbox.alert('Monitor Created',function(){
          window.location.reload();
        });
      },
      error:function(model, response, options){
        new ServerError(response.responseJSON);
      }
    });
  },
  update: function(id,data){
    if (!id) return console.error('id is required');

    var monitor = new App.Models.Monitor({ id: id });
    monitor.set(data);
    monitor.save({},{
      success:function(model, response, options){
        bootbox.alert('Monitor Updated',function(){
          window.location.reload();
        });
      },
      error:function(model, response, options){
        new ServerError(response.responseJSON);
      }
    });
  },
  remove: function(id,done){
    if (!id) return console.error('id is required');
    var monitor = new App.Models.Monitor({ id: id });
    monitor.destroy({
      success:function(model, response, options){
        if (done) return done();
        bootbox.alert('Monitor Removed',function(){
          window.location.reload();
        });
      },
      error:function(model, response, options){
        new ServerError(response.responseJSON);
      }
    });
  },
  get: function(id){
    if (!id) return console.error('id is required');
  },
  mute: function (id) {
    changeAlerts (id, false, function(err){
      if (!err) bootbox.alert('Ready! Alerts are disabled.')
      else bootbox.alert('An error has ocurr')
    })
  },
  unmute: function (id) {
    changeAlerts (id, true, function(err){
      if (!err) bootbox.alert('Ok, alerts are enabled again.')
      else bootbox.alert('An error has ocurr')
    })
  },
  muteAll: function (ids) {
    $.blockUI()
    var errorRised = false
    var done = lodash.after(ids.length,function(){
      $.unblockUI()
      if (!errorRised) {
        window.location.reload()
      } else {
        bootbox.confirm(
          'Not all operation could be fulfilled',
          window.location.reload
        )
      }
    })

    for (var i=0; i<ids.length; i++) {
      var id = ids[i]
      changeAlerts(id, false, function(err){
        if (err) riseError(errorRised)
        done()
      })
    }
  },
  unmuteAll: function (ids) {
    var errorRised = false
    $.blockUI()
    var session = Date.now()
    var done = lodash.after(ids.length, function(){
      $.unblockUI()
      if (!errorRised) {
        window.location.reload()
      } else {
        bootbox.confirm(
          'Not all operation could be fulfilled',
          window.location.reload
        )
      }
    })

    for (var i=0; i<ids.length; i++) {
      var id = ids[i]
      changeAlerts(id, true, function(err){
        if (err) riseError(errorRised)
        done()
      })
    }
  }
}

function riseError (errorRised) {
  if (!errorRised) {
    errorRised = true
    bootbox.alert('An error has ocurr..please refresh')
  }
}

function changeAlerts (resource_id, enable, next) {
  next || (next = function(){})

  if (typeof enable === 'boolean') {
    jQuery
      .ajax({
        url: '/resource/' + resource_id + '/alerts',
        type: 'PATCH',
        data: { enable: enable }
      })
      .done(function(data) {
        next(null,data)
      })
      .fail(function(xhr, err, xhrStatus) {
        next(err)
      })
  }
}
