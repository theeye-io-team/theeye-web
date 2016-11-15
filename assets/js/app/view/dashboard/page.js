'use strict';
var DashboardPage = (function(){

  var statesDicc = {
    normal: 0,
    failure: 1,
    updates_stopped: 2,
    unknown: 3
  }

  var iconsDicc = {
    normal: "icon-check",
    failure: "icon-warn",
    updates_stopped: "icon-error",
    unknown: "icon-nonsense"
  }

  var monitors = new App.Collections.Monitors();
  var tasks = new App.Collections.Tasks();

  var MonitorView = BaseView.extend({
    template: Templates['assets/templates/dashboard/monitor-row.hbs'],
    events:{ },
  });

  var TaskView = BaseView.extend({
    template: Templates['assets/templates/dashboard/task-row.hbs'],
    events:{ },
  });

  var Index = BaseView.extend({
    autoRender: true,
    template: Templates['assets/templates/dashboard/page.hbs'],
    container: $('[data-hook=page-container]')[0],
    events:{
    },
    render:function(){
      BaseView.prototype.render.apply(this, arguments);

      this.renderCollection(
        monitors,
        MonitorView,
        this.queryByHook('monitors-container')[0]
      );

      this.renderCollection(
        tasks,
        TaskView,
        this.queryByHook('tasks-container')[0]
      );

      // bind searchbox input
      $.searchbox();
    }
  });

  return function () {
    var page = new Index({});
    SocketsConnector({io: window.io});

    monitors.fetch();
    tasks.fetch();
  }
})();
