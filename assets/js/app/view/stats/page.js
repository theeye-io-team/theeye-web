'use strict';

/**
 *
 * @author Facugon
 * @module StatsPage
 * @namespace Views 
 *
 */
function StatsPage () {

  var StatModel = Backbone.Model.extend({ });
  var StatCollection = Backbone.Collection.extend({ model: StatModel });

  function getState (id,next) {
    var host, stats, resource;

    var done = lodash.after(3, function(){
      next(null,{
        host: host,
        stats: stats,
        resource: resource
      });
    });

    var host = new App.Models.Host({ id: id });
    host.fetch({
      success:function(){
        done();
      },
      failure:function(){
        next(new Error('host fetch error'));
      }
    });

    var resource = new App.Models.Monitor();
    resource.fetch({
      data: {
        where:{
          host_id: id,
          type: 'host',
          enable: true
        },
        limit: 1
      },
      success:function(){
        done();
      },
      failure:function(){
        next(new Error('host resource fetch error'));
      }
    });

    $.ajax({
      method:'get',
      url:'/api/host/' + id + '/stats',
      dataType:'json'
    }).done(function(data){
      stats = new StatCollection(data);
      done();
    }).fail(function(xhr,status){
      next(new Error(status));
    });

  }

  function subscribeSocketNotifications(resource) {
    var host = window.location.pathname.split('/')[2];
    io.socket.post('/hoststats/subscribe/' + host, {
      resource: resource
    }, function serviceSocketSubscription(data, jwres) {
      log(data);
      log(jwres);
    });
  }

  function log() {
    var deb = debug('eye:web:stats');
    deb.apply(deb, arguments);
  }

  var Psaux = function(options){
    var config = {
      filter: '',
      sort: {
        column: '',
        direction: 'asc'
      }
    };

    /** PS aux table */
    var $el = options.$el;
    var $psauxTable = $el.find("#psaux-table"),
      $psauxTbody = $el.find("#psaux-table tbody"),
      $psauxSearchInput = $el.find("#ps-search");

    function render (rows) {
      // Clear the  TBODY
      $psauxTbody.find("tr:not(.search-sf):not(.search-query-sf)").remove();
      var $rows = [];

      $rows = rows.map(function mapPsauxToRows(ps) {
        var $cols = [];
        var $tr = $("<tr></tr>");
        for (var col in ps) {
          var $td = $("<td></td>");
          $td.html(ps[col]);
          $cols.push($td);
        }
        $tr.append($cols);
        return $tr;
      });
      $psauxTbody.append($rows);
    };

    function processSort () {
      if (!config.sort.column) return;

      var data = $psauxTable.data('data');
      var sortedData = lodash.orderBy(
        data,
        [config.sort.column],
        [config.sort.direction]
      );
      $psauxTable.data('data',sortedData);
    };

    function filterProcesses () {
      $psauxTable.find('.search-sf').remove();
      // affect all table rows on in systems table
      var tableRowsClass = $('.table-list-search tbody tr');
      tableRowsClass.each(function(i, val) {

        //Lower text for case insensitive
        var rowText = $(val).text().toLowerCase();
        if (config.filter != '') {
          $psauxTable.find('.search-query-sf').remove();
          $psauxTbody.prepend('<tr class="search-query-sf"><td colspan="6"><strong>Searching for: "' + config.filter + '"</strong></td></tr>');
        } else {
          $psauxTable.find('.search-query-sf').remove();
        }

        if (rowText.indexOf(config.filter) == -1) {
          //hide rows
          tableRowsClass.eq(i).hide();

        } else {
          $psauxTable.find('.search-sf').remove();
          tableRowsClass.eq(i).show();
        }
      });

      //all tr elements are hidden
      if (tableRowsClass.children(':visible').length == 0) {
        $psauxTbody.append('<tr class="search-sf"><td class="text-muted" colspan="6">No entries found.</td></tr>');
      }
    }

    return {
      update: function (data) {
        log('new psaux data');
        log(data);
        $psauxTable.data("data", data.stat);
        // Sort renderPsaux & filter
        processSort();
        render($psauxTable.data("data"));
        filterProcesses();
      },
      createControl: function () {
        // Click sobre el th[data-sort] ordena por esa columna
        $psauxTable.find('th[data-sort]').click(function() {
          var orderBy = $(this).data("sort");
          if (orderBy == config.sort.column) {
            config.sort.direction = (config.sort.direction === 'desc') ? 'asc' : 'desc';
          }
          config.sort.column = orderBy;
          // reverse the order if sort is the current sort order
          processSort();
          render($psauxTable.data("data"));
        });

        //something is entered in search form
        $psauxSearchInput.keyup(function() {
          var that = this;
          var inputText = $(that).val().toLowerCase().trim();

          config.filter = inputText;
          _.debounce(filterProcesses, 500)();
        });
      }
    }
  };

  var LoadAverageView = BaseView.extend({
    initialize: function(){
      BaseView.prototype.initialize.apply(this,arguments);
      this.listenTo(this.model,'change',this.render);
    },
    render: function(){
      BaseView.prototype.render.apply(this,arguments);
      var stats = this.model.get('stats');

      var $load1 = this.queryByHook('load_average_1');
      $load1.html(parseFloat(stats.load_1_minute).toFixed(2));

      var $load5 = this.queryByHook('load_average_5');
      $load5.html(parseFloat(stats.load_5_minute).toFixed(2));

      var $load15 = this.queryByHook('load_average_15');
      $load15.html(parseFloat(stats.load_15_minute).toFixed(2));
    }
  });

  function getBlueToRed(percent){
    var b = percent < 50 ? 255 : Math.floor(255 - (percent * 2 - 100) * 255 / 100);
    var r = percent > 50 ? 150 : Math.floor((percent * 2) * 150 / 100);
    return 'rgb(' + r + ', 0, ' + b + ')';
  }

  var VerticalBarView = BaseView.extend({
    template: Templates['assets/templates/stats-page/progress-bar-vertical.hbs'],
    render: function(){
      this.renderTemplate();
      this.queryByHook('percent').css('height', this.percent + '%');
      this.queryByHook('percent').css('background', getBlueToRed(this.percent));
      this.queryByHook('percent_tag').html(this.percent_tag);
      this.queryByHook('tag').html(this.tag);
    }
  });

  var StatGraphView = BaseView.extend({
    initialize: function(options){
      BaseView.prototype.initialize.apply(this,arguments);
      this.listenTo(this.model,'change',this.render);
    },
    render: function(){
      BaseView.prototype.render.apply(this,arguments);
      var $container = this.$el;
      $container.empty();

      var cacheValue, cpuValue, memValue,
        cacheBar, cpuBar, memBar,
        stat = this.model.get('stats');

      cpuValue = parseInt(100 - stat.cpu_idle);
      memValue = parseInt(stat.mem_used * 100 / stat.mem_total);
      cacheValue = parseInt((stat.cacheTotal - stat.cacheFree) * 100 / stat.cacheTotal);

      cpuBar = new VerticalBarView({ percent: cpuValue, percent_tag: cpuValue, tag: 'CPU' });
      cpuBar.render();
      cpuBar.$el.appendTo($container);

      memBar = new VerticalBarView({ percent: memValue, percent_tag: memValue, tag: 'MEM' });
      memBar.render();
      memBar.$el.appendTo($container);

      cacheBar = new VerticalBarView({ percent: cacheValue, percent_tag: cacheValue, tag: 'CACHE' });
      cacheBar.render();
      cacheBar.$el.appendTo($container);

      _.each(stat.disk,function(disk,index){ // object
        if (index !== 'total') {
          var diskValue = parseInt(disk.usage.used * 100 / disk.usage.total);
          var diskBar = new VerticalBarView({
            percent: diskValue,
            percent_tag: diskValue,
            tag: index.toUpperCase()
          });
          diskBar.render();
          diskBar.$el.appendTo($container);
        }
      });
    }
  });

  var HostView = BaseView.extend({
    template: Templates['assets/templates/stats-page/host.hbs'],
    initialize: function(){
      BaseView.prototype.initialize.apply(this,arguments);

      this.listenTo(this.host,'change',this.onChange);
      this.listenTo(this.resource,'change',this.onChange);

      var _state_text = '';
      var _state_color = '';

      Object.defineProperty(this,'state',{
        set: function(state){
          switch(state){
            case 'updates_stopped':
              _state_text = 'has stopped reporting updates';
              _state_color = 'rgb(255,0,0)';
              break;
            case 'failure':
              _state_text = 'is failing';
              _state_color = 'rgb(255,255,0)';
              break;
            case 'normal':
              _state_text = 'is reporting';
              _state_color = 'rgb(0,255,0)';
              break;
            default:
              _state_text = 'state is unknown';
              _state_color = 'rgb(255,0,0)';
              break;
          }
          return this;
        },
      });

      Object.defineProperty(this,'state_text',{
        get: function(){ return _state_text; }
      });

      Object.defineProperty(this,'state_color',{
        get: function(){ return _state_color; }
      });

      this.state = this.resource.get('state');
    },
    onChange: function(){
      this.state = this.resource.get('state');
      this.render();
    }
  });

  var IndexView = BaseView.extend({
    template: Templates['assets/templates/stats-page/index.hbs'],
    initialize: function(options){
      BaseView.prototype.initialize.apply(this,arguments);
    },
    initPsaux: function(){
      var stat = this.stats.find(function(stat){
        return stat.get('type') === 'psaux';
      });
      if (!stat) return;

      var psaux = new Psaux({ $el: this.queryByHook('processes-container') });
      psaux.createControl();
      psaux.update({
        // Hago el map porque las properties llegan en diferente
        // orden desde sns y desde mongo local
        stat: stat.get('stats').map(function (s) {
          return {
            'user'    : s.user,
            'pid'     : s.pid,
            '%cpu'    : s['%cpu'],
            '%mem'    : s['%mem'],
            'vsz'     : s['vsz'],
            'rss'     : s['rss'],
            'tty'     : s['tty'],
            'state'   : s['state'],
            'started' : s['started'],
            'time'    : s['time'],
            'command' : s['command']
          };
        })
      });

      // connect and subscribe psaux notifications
      log('psaux listening socket updates');
      function subscribe () {
        io.socket.on('psaux_update', psaux.update);
        subscribeSocketNotifications('psaux');
      }
      if (io.socket.socket && io.socket.socket.connected) subscribe();
      io.socket.on('connect',subscribe);
    },
    initStat: function(){
      var self = this,
        stat = this.stats.find(function(stat){
        return stat.get('type') === 'dstat';
      });
      if (!stat) return;

      var loadAverageView = new LoadAverageView({
        $el: this.queryByHook('stat-load-container'),
        model: stat
      });
      loadAverageView.render();

      var statGraphView = new StatGraphView({ model: stat });
      statGraphView.render();
      statGraphView.$el.appendTo(this.queryByHook('stat-graph-container'));

      // connect and subscribe host-stats notifications
      // update stat state when updates arrive
      log('dstat listening socket updates');
      function subscribe () {
        io.socket.on('host-stats_update',function(data){
          log('new dstat data');
          log(data);
          self.resource.set('last_update',new Date());
          stat.set(data);
        });
        subscribeSocketNotifications('host-stats');
      }
      if (io.socket.socket && io.socket.socket.connected) subscribe();
      io.socket.on('connect',subscribe);
    },
    render:function(){
      BaseView.prototype.render.apply(this,arguments);
      this.initPsaux();
      this.initStat();

      this.hostView = new HostView({
        host: this.host,
        resource: this.resource
      });

      this.hostView.render();
      this.hostView.$el.appendTo(this.queryByHook('host-container'));
    }
  });

  var Controller = function (){ }
  Controller.prototype = {
    index: function(){
      var id = document.location.pathname.replace('/hoststats/','');
      getState(id,function(err,state){
        var view = new IndexView(state);
        view.render();
        view.$el.appendTo( $('[data-hook=page-container]') );
      });
    }
  }

  var controller = new Controller();
  controller.index();
  return controller;
}
