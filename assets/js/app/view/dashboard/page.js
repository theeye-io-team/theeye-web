'uuid(),se strict';

function DashboardPage () {

  var stateIcons = {
    normal: "icon-check",
    failure: "icon-warn",
    updates_stopped: "icon-error",
    unknown: "icon-nonsense"
  }

  var classToState = {
    "icon-check": "normal",
    "icon-warn": "failure",
    "icon-error": "updates_stopped",
    "icon-nonsense": "unknown"
  };

  var ItemsFolding = function (el) {
    var $el = $(el);
    var $items = $el.find('[data-hook=hidden-items]');
    var $button = $el.find('[data-hook=toggle-hidden-items]');
    var $icon = $button.find('span');

    this.$container = $el.find('[data-hook=hidden-items-container]');

    function toggle () {
      $items.slideToggle();
      $icon.toggleClass('glyphicon-menu-down glyphicon-menu-up');
    }

    $button.on('click',toggle);
    this.toggle = toggle;

    this.fold = function(){
      $items.slideUp();
      if ($icon.hasClass('glyphicon-menu-up')) {
        $icon
          .removeClass('glyphicon-menu-up')
          .addClass('glyphicon-menu-down');
      }
    };

    this.unfold = function(){
      $items.slideDown();
      if ($icon.hasClass('glyphicon-menu-down')) {
        $icon
          .removeClass('glyphicon-menu-down')
          .addClass('glyphicon-menu-up');
      }
    };

    this.hideButton = function(){
      $button.hide();
    }

    this.showButton = function(){
      $button.show();
    }
  }

  /**
   *
   * Backbone Views
   *
   */
  var SubmonitorView = BaseView.extend({
    tagName:'tr',
    className:'submonitoRow',
    template:Templates['assets/templates/dashboard/submonitor-row.hbs'],
    events:{},
    initialize:function(){
      this.stateIcon = stateIcons[this.model.get('state')];
      this.listenTo(this.model,'change:state',this.updateStateIcon);
    },
    updateStateIcon:function(){
      this.stateIcon = stateIcons[this.model.get('state')];
      this.queryByHook('state-icon')[0].className = this.stateIcon;
    },
  });

  var SubmonitorGroupView = SubmonitorView.extend({
    template:Templates['assets/templates/dashboard/submonitor-group-row.hbs'],
  });

  var MonitorView = BaseView.extend({
    template: Templates['assets/templates/dashboard/monitor-row.hbs'],
    className:'monitorRow',
    events:{ },
    initialize:function(){
      this.listenTo(this.model.get('submonitors'),'change',this.updateStateIcon);
    },
    updateStateIcon:function(){
      var highState = this.model
        .get('submonitors').reduce(function(highState,monitor){
          var state = monitor.get('state');
          if (!highState) return state;
          var p1=monitorStatePriority[state],
            p2=monitorStatePriority[highState];
          return (p1>p2) ? state : highState;
        },null);

      this.stateIcon = stateIcons[highState];
      this.state = highState;
      this.queryByHook('state-icon')[0].className = this.stateIcon;

      this.trigger('change:stateIcon',this);
    },
    render:function(){
      BaseView.prototype.render.apply(this, arguments);
      this.renderCollection(
        this.model.get('submonitors'),
        SubmonitorView,
        this.queryByHook('submonitors-container')[0]
      );
      this.updateStateIcon();
    }
  });

  var MonitorGroupView = MonitorView.extend({
    render:function(){
      BaseView.prototype.render.apply(this, arguments);

      var columns =
        '<th></th>' + 
        '<th>Name</th>' +
        '<th>Hostname</th>' +
        '<th>Type</th>' +
        '<th>Last Update</th>' +
        '<th><span class=""></span></th>' ;

      this.queryByHook('title-cols').html(columns);

      this.queryByHook('collapse-container').find('h4').remove();

      this.renderCollection(
        this.model.get('submonitors'),
        SubmonitorGroupView,
        this.queryByHook('submonitors-container')[0],
      );
      this.updateStateIcon();
    }
  });


  var TaskView = BaseView.extend({
    className:'taskRow',
    template: Templates['assets/templates/dashboard/task-row.hbs'],
    events:{ },
  });

  var Index = BaseView.extend({
    autoRender: true,
    template: Templates['assets/templates/dashboard/page.hbs'],
    container: $('[data-hook=page-container]')[0],
    events:{
      'click [data-hook=up-and-running] i':'hideUpAndRunning'
    },
    initialize:function(options){
      BaseView.prototype.initialize.apply(this,arguments);

      this.monitors = options.monitors;
      this.monitorGroups = options.monitorGroups;
      this.tasks = options.tasks;
    },
    hideUpAndRunning:function(){
      this.$upandrunning.slideUp();
      this.$monitorsPanel.slideDown(); 
    },
    render:function(){
      BaseView.prototype.render.apply(this, arguments);

      this.monitorRows = this.renderCollection(
        this.monitorGroups,
        function(options){
          var model = options.model;
          if (model.get('type')=='group') {
            return new MonitorGroupView(options);
          } else {
            return new MonitorView(options);
          }
        },
        this.queryByHook('monitors-container')[0]
      );

      this.renderCollection(
        this.tasks,
        TaskView,
        this.queryByHook('tasks-container')[0]
      );

      this.monitorsFolding = new ItemsFolding( this.queryByHook('monitors-fold-container') );
      this.tasksFolding = new ItemsFolding( this.queryByHook('tasks-fold-container') );
      this.$upandrunning = this.queryByHook('up-and-running');
      this.$monitorsPanel = this.find('[data-hook=monitors-container]');

      this.listenTo(this.monitors,'sync',this.checkMonitors);
      //this.listenTo(this.monitors,'change',this.checkMonitors);
      for (var i=0;i<this.monitorRows.views.length;i++) {
        var view = this.monitorRows.views[i];
        view.on('change:stateIcon',this.checkMonitors,this);
      }

      this.checkMonitors();

      // bind searchbox events
      var self = this;
      var searchbox = $.searchbox(); 
      searchbox.on('search:start',function(){
        log('searching');
        self.$upandrunning.slideUp();
        self.$monitorsPanel.slideDown();
        self.monitorsFolding.unfold();
      });
      searchbox.on('search:empty',function(){
        log('stop searching');
        self.checkMonitors();
        self.monitorsFolding.fold();
      });
    },
    checkMonitors:function(){
      var failing = this.monitors.filter(function(monitor){
        var state = monitor.get('state');
        return state=='failure' || state=='updates_stopped';
      });

      if (failing.length>0) {
        this.foldMonitors();
        this.$upandrunning.slideUp();
        this.$monitorsPanel.slideDown();
        this.monitorsFolding.showButton();
      } else {
        this.unfoldMonitors();
        this.$upandrunning.slideDown();
        this.$monitorsPanel.slideUp();
        this.monitorsFolding.hideButton();
      }
    },
    /**
     * move ok monitors to fold
     */
    foldMonitors: function(){
      var self = this;
      this.find('.monitorRow').each(function(){
        var $row = $(this);
        var stateIcon = $row.find('.panel-heading .state-icon span')[0];
        if ( !/warn|error/.test(stateIcon.className) ) {
          $row.appendTo(self.monitorsFolding.$container);
        } else {
          $row.prependTo(self.$monitorsPanel);
        }
      });
    },
    /**
     * restore to default
     */
    unfoldMonitors: function(){
      var self = this;
      this.find('.monitorRow').each(function(){
        var $row = $(this);
        $row.appendTo(self.$monitorsPanel);
      });
    }
  });


  $(document).on('keypress',function(event){
    $('.js-searchable-box input').focus();
  });


  function attachToHost(monitors){
    var typesToGroup=['host','dstat','psaux'],
      groups={},
      groupedMonitors = new Backbone.Collection();

    monitors.forEach(function(monitor){
      if (typesToGroup.indexOf(monitor.get('type')) !== -1) {
        if (!groups[monitor.get('hostname')]) {
          groups[monitor.get('hostname')] = {};
        }

        groups[monitor.get('hostname')][monitor.get('type')] = monitor;
      } else {
        monitor.set('submonitors', new Backbone.Collection());
        monitor.get('submonitors').add(monitor);
        groupedMonitors.add(monitor);
      }
    });

    for (var hostname in groups) {
      var group = groups[hostname];
      var host = group['host'];

      host.set('submonitors', new Backbone.Collection());
      host.get('submonitors').add([
        group['host'],
        group['dstat']
      ]);
      groupedMonitors.add(host);
    }

    return groupedMonitors;
  }

  function groupByTags (monitors,tags) {
    if (!Array.isArray(tags)||tags.length===0) {
      return monitors;
    }

    var groups = [];
    tags.forEach(function(t){
      groups.push({
        id: uid(),
        tags: [t,'group'],
        type: 'group',
        name: t.toLowerCase(),
        description: t,
        submonitors: new Backbone.Collection()
      });
    });

    monitors.forEach(function(monitor){
      var ctags = monitor.get('tags');
      if (!Array.isArray(ctags)||ctags.length===0) {
        return;
      }

      ctags.forEach(function(tag){
        var ltag = tag.toLowerCase();
        if (tags.indexOf(ltag) !== -1) {
          lodash.find(groups,function(g){
            return g.name == ltag 
          }).submonitors.add(monitor);
        } else {
          // do not group nor show. ignore
        }
      });
    });

    return new Backbone.Collection(groups);
  }

  (function index () {
    var monitors, tasks, synced;
    var tags, query = URI().search(true);

    if (Array.isArray(query.tags)) {
      tags = query.tags.map(function(t){
        return t.toLowerCase() 
      });
    } else {
      if (typeof query.tags == 'string') {
        tags = [query.tags.toLowerCase()];
      }
    }

    synced = lodash.after(2,function(){
      var groups = groupByTags(attachToHost(monitors),tags);

      new Index({
        monitorGroups: groups,
        monitors: monitors,
        tasks: tasks
      });
    });

    monitors = new App.Collections.Monitors();
    monitors.once('sync',synced);

    tasks = new App.Collections.Tasks();
    tasks.once('sync',synced);

    var MonitorsEvents = {
      update : function(event){
        var id = event.id, state = event.state;
        var monitor = monitors.get(id);
        monitor.set("state",state);
        monitors.sort();
      }
    };

    // connect sockets and start listening to events
    SocketsConnector({
      io: window.io,
      channel:'/events/subscribe',
      query: {
        customer: Cookies.getJSON('theeye').customer 
      },
      onSubscribed:function(data,jwres){
        log('subscribed to event updates');
      },
      events: {
        'events-update': MonitorsEvents.update
      }
    });

    // fetch monitors and start page.
    monitors.fetch();
    tasks.fetch();
  })();
}
