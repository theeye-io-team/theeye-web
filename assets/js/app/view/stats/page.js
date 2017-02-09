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

  var Stats = {
    loadAverage: {},
    gauges: {}
  };

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

  var Stat = function(options){
    function updateGauges(dstat) {
      var memoryValue = (dstat.stat.mem_used * 100 / dstat.stat.mem_total);
      Stats.gauges.memoryConsumption.refresh(memoryValue.toFixed(2));

      var cpuValue = (100 - dstat.stat.cpu_idle);
      Stats.gauges.cpuConsumption.refresh(cpuValue.toFixed(2));

      var cacheValue = ((dstat.stat.cacheTotal - dstat.stat.cacheFree) * 100 / dstat.stat.cacheTotal);
      Stats.gauges.cacheConsumption.refresh(cacheValue.toFixed(2));

      //var diskValue = (dstat.stat.disk.total.usage.used * 100 / dstat.stat.disk.total.usage.total);
      //Stats.gauges.diskConsumption.refresh(diskValue.toFixed(2));
      var gauges = Stats.gauges.disks;
      var disks = dstat.stat.disk;
      _.each(disks,function(disk,index){ // object
        gauges.forEach(function(gauge){ // array
          if(gauge.name == index){
            var value = (disk.usage.used * 100 / disk.usage.total);
            gauge.elem.refresh(value.toFixed(2));
          }
        });
      });
    }

    function updateDiskUsage(disk) {
      var $diskusage = $("#diskusage");
      $diskusage.html("");
      Object.keys(disk).forEach(function(d) {
        if(d != 'total'){
          var $div = $("<div />");
          var name = d;
          var total = disk[d].usage.total;
          var usage = disk[d].usage.used / total * 100;
          var $title = $("<h3 />").html(name);
          var $bar = $("<div />").addClass("progress").css("width", "100%");
          var $barInner = $("<div />").addClass("progress-bar").css("width", usage + "%");
          $barInner.html(usage.toFixed(2) + "%");
          if (usage < 5) {
            $barInner.addClass("progress-bar-danger");
          } else if (usage < 25) {
            $barInner.addClass("progress-bar-warning");
          } else {
            $barInner.addClass("progress-bar-success");
          }
          $bar.append($barInner);
          $div.append($title);
          $div.append($bar);
          $diskusage.append($div);
        }
      });
    }

    function updateLoadAverage(dstat) {
      var lavg1 = dstat.stat.load_1_minute.toFixed(2);
      var lavg5 = dstat.stat.load_5_minute.toFixed(2);
      var lavg15 = dstat.stat.load_15_minute.toFixed(2);
      $loadAvg1.html(lavg1);
      $loadAvg5.html(lavg5);
      $loadAvg15.html(lavg15);
    }

    function createGauges() {
      if (Object.keys(Stats.gauges).length) {
        // Si los gauges ya está creados
        return;
      }
      Stats.gauges.memoryConsumption = new JustGage({
        id: "memoryconsumption",
        value: 0,
        min: 0,
        max: 100,
        title: "Memory Usage",
        label: "Percentage",
        titleFontColor: "#eee",
        valueFontColor : "#eee",
        labelFontColor : "#eee",

      });
      Stats.gauges.cpuConsumption = new JustGage({
        id: "cpuconsumption",
        value: 0,
        min: 0,
        max: 100,
        title: "CPU Usage",
        label: "Percentage",
        titleFontColor: "#eee",
        valueFontColor : "#eee",
        labelFontColor : "#eee",
      });
      Stats.gauges.cacheConsumption = new JustGage({
        id: "cacheconsumption",
        value: 0,
        min: 0,
        max: 100,
        title: "Swap Usage",
        label: "Percentage",
        titleFontColor: "#eee",
        valueFontColor : "#eee",
        labelFontColor : "#eee",
      });
    }

    function createDiskGauges(disks) {
      var $container = $("#gaugescontainer #disksconsumptioncontainer");
      var disksGauges = [];
      disks.forEach(function(disk){
        if( disk != 'total' ) {
          var id = "disk" + disk + "usage";
          $('<div class="col-sm-4"></div>').attr('id',id).appendTo($container);
          var gauge = new JustGage({
            id: id,
            value: 0,
            min: 0,
            max: 100,
            title: "Disk " + disk + " Usage",
            label: "Percentage",
            titleFontColor: "#eee",
            valueFontColor : "#eee",
            labelFontColor : "#eee",
          });
          disksGauges.push({
            name: disk,
            elem: gauge
          });
        }
      });
      Stats.gauges.disks = disksGauges;
    }

    return {
      update: function(dstat){
        log('new host-stats data');
        log(dstat);

        updateLoadAverage({ stat: dstat.stats });
        updateGauges({ stat: dstat.stats });
        updateDiskUsage( dstat.stats.disk );
      },
      initialize: function(options){
        createGauges();
        createDiskGauges(options.disks);
      }
    };
  }

  var LoadAverageView = BaseView.extend({
    initialize: function(){
      BaseView.prototype.initialize.apply(this,arguments);
      this.listenTo(this.model,'change',this.render);
    },
    render:function(){
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
