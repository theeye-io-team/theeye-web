'use strict';
var DashboardPage = (function(){

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

      // bind searchbox input
      $.searchbox();

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
    }
  });

  return function () {
    var page = new Index({});

    monitors.fetch();
    tasks.fetch();
  }
})();
