'use strict';

function DashboardPage () {

  var MonitorsEvents = {
    update : function(event){
      var id = event.id;
      var state = event.state;

      var monitor = monitors.get(id);
      monitor.set("state",state);
    }
  };

  var socketsConnector = SocketsConnector({
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

  var statesDicc = {
    normal: 0,
    failure: 1,
    updates_stopped: 2,
    unknown: 3
  }

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

  var monitors = window.monitors = new App.Collections.Monitors();
  var tasks = window.tasks = new App.Collections.Tasks();

  var MonitorView = BaseView.extend({
    template: Templates['assets/templates/dashboard/monitor-row.hbs'],
    className:'monitorRow',
    events:{ },
    initialize:function(){
      this.stateIcon = stateIcons[this.model.get('state')];
      this.listenTo(this.model,'change:state',this.updateStateIcon);
    },
    updateStateIcon:function(){
      this.stateIcon = stateIcons[this.model.get('state')];
      this.queryByHook('state-icon')[0].className = this.stateIcon;
    }
  });

  var TaskView = BaseView.extend({
    className:'taskRow',
    template: Templates['assets/templates/dashboard/task-row.hbs'],
    events:{ },
  });

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

  var Index = BaseView.extend({
    autoRender: true,
    template: Templates['assets/templates/dashboard/page.hbs'],
    container: $('[data-hook=page-container]')[0],
    events:{
      'click [data-hook=up-and-running] i':'hideUpAndRunning'
    },
    hideUpAndRunning:function(){
      this.$upandrunning.slideUp();
      this.$monitorsPanel.slideDown(); 
    },
    render:function(){
      BaseView.prototype.render.apply(this, arguments);

      this.monitorsViews = this.renderCollection(
        monitors,
        MonitorView,
        this.queryByHook('monitors-container')[0]
      );

      this.tasksViews = this.renderCollection(
        tasks,
        TaskView,
        this.queryByHook('tasks-container')[0]
      );

      this.monitorsFolding = new ItemsFolding( this.queryByHook('monitors-fold-container') );
      this.tasksFolding = new ItemsFolding( this.queryByHook('tasks-fold-container') );
      this.$upandrunning = this.queryByHook('up-and-running');
      this.$monitorsPanel = this.find('[data-hook=monitors-panel] .panel-group');

      this.listenTo(monitors,'sync',this.checkMonitors);
      this.listenTo(monitors,'change',this.checkMonitors);

      // bind searchbox events
      var self = this;
      var synced = lodash.after(2,function(){
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
      });
      monitors.once('sync',synced);
      tasks.once('sync',synced);
    },
    checkMonitors:function(){
      var failing = monitors.filter(function(monitor){
        var state = monitor.get('state');
        return state == 'failure' || state == 'updates_stopped';
      });

      if (failing.length>0) {
        this.sortMonitors();
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
    sortMonitors:function(){
      // visual sort
      this.find('.monitorRow').sort(function(a,b){
        //get state icon element
        var stateIconA = $('.state-icon span', a).first()[0];
        //get element classes that matches 'icon-*'
        var iconClassA = stateIconA.classList.value.split(" ").find(function(cls){
          return cls.indexOf('icon-') === 0;
        });
        //get state from class
        var stateValueA = classToState[iconClassA];

        var stateIconB = $('.state-icon span', b).first()[0];
        var iconClassB = stateIconB.classList.value.split(" ").find(function(cls){
          return cls.indexOf('icon-') === 0;
        });
        var stateValueB = classToState[iconClassB];

        return statesDicc[stateValueA] < statesDicc[stateValueB];
      }).prependTo('[data-hook=monitors-container]');
    },
    /**
     * move normal monitors to fold
     */
    foldMonitors: function(){
      var self = this;
      this.find('.monitorRow').each(function(){
        var $row = $(this);
        var stateIcon = $row.find('.panel-heading .state-icon span')[0];
        if ( !/warn|error/.test(stateIcon.className) ) {
          $row.appendTo(self.monitorsFolding.$container);
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

  var page = new Index({});

  monitors.fetch();
  tasks.fetch();

}
